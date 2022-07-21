import fs from 'node:fs';
import * as readline from 'node:readline';
import { db } from '..';
import {downloadEDDB} from '../downloader/downloader';
import {ISystemPopulated} from '../models/ISytemPopulated';
import {ICommodity} from '../models/ICommodity';
import csv from 'csv-parser';
import {IListing} from '../models/IListing';
import {IStation} from '../models/IStation';
import zlib from 'node:zlib';
import {calculateUnixEpochDaysAgo, MIN_PAD_SIZE} from './FindTradeOptions';

const BASE_FILE_LOC = 'files/';
const INSERT_BATCH_SIZE = 100000;

const MLP_Mapping = new Map<string, number>();
MLP_Mapping.set('S', MIN_PAD_SIZE.S);
MLP_Mapping.set('M', MIN_PAD_SIZE.M);
MLP_Mapping.set('L', MIN_PAD_SIZE.L);

export async function refreshDatabase(download = false) {
  const tableCreateProcesses: Promise<void>[] = [];
  if (download) {
    tableCreateProcesses.push(downloadEDDB('systems_populated.jsonl').then(() => recreate_systems_populated_v6()));
    tableCreateProcesses.push(downloadEDDB('listings.csv').then(() => recreate_listings_v6()));
    tableCreateProcesses.push(downloadEDDB('stations.jsonl').then(() => recreate_stations_v6()));
    tableCreateProcesses.push(downloadEDDB('commodities.json').then(() => recreate_commodities_v6()));
  } else {
    tableCreateProcesses.push(recreate_systems_populated_v6());
    tableCreateProcesses.push(recreate_listings_v6());
    tableCreateProcesses.push(recreate_stations_v6());
    tableCreateProcesses.push(recreate_commodities_v6());
  }

  exec_recreate('EDAR_state');

  Promise.all(tableCreateProcesses).then(() => {
    const index_query = fs.readFileSync(__dirname + '/sql/create_indices_and_views.sql', 'utf8');
    db.exec(index_query);
  });
}

async function recreate_systems_populated_v6() {
  exec_recreate('systems_populated_v6');

  const systemsFile = BASE_FILE_LOC + 'systems_populated.jsonl.gz';
  const rl = readline.createInterface({
    input: fs.createReadStream(systemsFile).pipe(zlib.createGunzip())
  });

  const prep = db.prepare('INSERT OR IGNORE INTO `systems_populated_v6`(`id`,`X`,`Y`,`Z`,`edsm_id`,`name`) VALUES (?,?,?,?,?,?);');

  const insertMany = db.transaction((cats: ISystemPopulated[]) => {
    for (const item of cats) {
      prep.run(item.id, item.x, item.y, item.z, item.edsm_id, item.name);
    }
  });

  let itemBuffer: ISystemPopulated[] = [];
  let counter = 1;
  console.time('Insert into systems_populated_v6');
  rl.on('line', (line) => {
    const item: ISystemPopulated = JSON.parse(line);
    itemBuffer.push(item);
    // prep.run(item.id, item.x, item.y, item.z, item.edsm_id, item.name);
    counter++;

    if (counter % INSERT_BATCH_SIZE === 0) {
      insertMany(itemBuffer);
      itemBuffer = [];
    }
  });

  rl.on('close', () => {
    insertMany(itemBuffer);
    console.timeEnd('Insert into systems_populated_v6');
  });
}

async function recreate_commodities_v6() {
  console.time('Insert into commodities_v6');
  exec_recreate('commodities_v6');

  const prep = db.prepare('INSERT OR IGNORE INTO `commodities_v6`(`id`, `name`, `EDDN_name`) VALUES (?,?,?);');
  let systemsFile = BASE_FILE_LOC + 'commodities.json.gz';
  let file = fs.readFileSync(systemsFile);
  const commodities: ICommodity[] = JSON.parse(zlib.gunzipSync(file).toString('utf8'));

  commodities.forEach(item => {
    prep.run(item.id, item.name, 'placeholder');
  });

  systemsFile = BASE_FILE_LOC + 'items.json.gz';
  file = fs.readFileSync(systemsFile);
  const commodities_2 = JSON.parse(zlib.gunzipSync(file).toString('utf8'));

  Object.entries(commodities_2).forEach(([key, value]) => {
    const val = value as { category: string, name: string, id: string };
    const full_name = val.name;

    db.prepare('UPDATE commodities_v6 set EDDN_name = ? WHERE name = ?').run(key, full_name);
  });


  console.timeEnd('Insert into commodities_v6');
}

async function recreate_stations_v6() {
  exec_recreate('stations_v6');

  const systemsFile = BASE_FILE_LOC + 'stations.jsonl.gz';
  const rl = readline.createInterface({
    input: fs.createReadStream(systemsFile).pipe(zlib.createGunzip())
  });

  const prep = db.prepare('INSERT OR IGNORE INTO `stations_v6`(`id`, `ed_market_id`, `system_id`, `max_landing_pad_size`, `distance_to_star`, `name`, `is_planetary`) VALUES (?,?,?,?,?,?, ?);');

  const insertMany = db.transaction((cats: { station: IStation, fulljson: string }[]) => {
    for (const item of cats) {
      const numeric_max_landing_pad_size = MLP_Mapping.get(item.station.max_landing_pad_size);
      const is_planetary = item.station.is_planetary ? 1 : 0;
      prep.run(item.station.id, item.station.ed_market_id, item.station.system_id, numeric_max_landing_pad_size, item.station.distance_to_star, item.station.name, is_planetary);
    }
  });

  let itemBuffer: { station: IStation, fulljson: string }[] = [];
  let counter = 1;
  console.time('Insert into stations_v6');
  rl.on('line', (line) => {
    const item: IStation = JSON.parse(line);
    itemBuffer.push({station: item, fulljson: line});
    // prep.run(item.id, item.x, item.y, item.z, item.edsm_id, item.name);
    counter++;

    if (counter % INSERT_BATCH_SIZE === 0) {
      insertMany(itemBuffer);
      itemBuffer = [];
    }
  });

  rl.on('close', () => {
    insertMany(itemBuffer);
    console.timeEnd('Insert into stations_v6');
  });
}

export const ageOfListingsToKeep = 21;
async function recreate_listings_v6() {
  const ignoreBeforeEpoch = calculateUnixEpochDaysAgo(ageOfListingsToKeep);

  exec_recreate('listings_v6');
  const listingsFile = BASE_FILE_LOC + 'listings.csv.gz';
  const prep = db.prepare('INSERT OR IGNORE INTO `listings_v6`(id, station_id, commodity_id, supply, supply_bracket, buy_price, sell_price, demand, demand_bracket, collected_at) VALUES (?,?,?,?,?,?,?,?,?,?);');

  const insertMany = db.transaction((cats: IListing[]) => {
    for (const item of cats) {
      if (item.collected_at > ignoreBeforeEpoch) {
        prep.run(item.id, item.station_id, item.commodity_id,
          item.supply, item.supply_bracket, item.buy_price,
          item.sell_price, item.demand, item.demand_bracket, item.collected_at);
      }
    }
  });

  let itemBuffer: IListing[] = [];
  let counter = 1;

  console.time('Insert into listings_v6');
  fs.createReadStream(listingsFile).pipe(zlib.createGunzip())
    .pipe(csv())
    .on('data', (item: IListing) => {
      itemBuffer.push(item);
      // prep.run(item.id, item.x, item.y, item.z, item.edsm_id, item.name);
      counter++;

      if (counter % INSERT_BATCH_SIZE === 0) {
        insertMany(itemBuffer);
        itemBuffer = [];
      }
    })
    .on('end', () => {
      insertMany(itemBuffer);
      console.timeEnd('Insert into listings_v6');
    });
}

function exec_recreate(tablename: string) {
  const filename = __dirname + `/sql/recreate_${tablename}.sql`;
  if (!fs.existsSync(filename)) {
    throw new Error('File does not exist ' + filename);
  }

  const recreate_listings = fs.readFileSync(filename, 'utf8');
  db.exec(recreate_listings);
}
