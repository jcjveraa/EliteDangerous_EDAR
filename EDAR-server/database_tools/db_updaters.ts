import fs from 'fs';
import * as readline from 'node:readline';
import {db} from '..';
import {downloadEDDB} from '../downloader/downloader';
import {ISystemPopulated} from '../models/ISytemPopulated';
import csv from 'csv-parser';
import {IListing} from '../models/IListing';
import {IStation} from '../models/IStation';
import zlib from 'node:zlib'
import {MIN_PAD_SIZE} from './FindTradeOptions';

const BASE_FILE_LOC = 'files/'
const INSERT_BATCH_SIZE = 100000;

const MLP_Mapping = new Map<string, number>();
MLP_Mapping.set('S', MIN_PAD_SIZE.S);
MLP_Mapping.set('M', MIN_PAD_SIZE.M);
MLP_Mapping.set('L', MIN_PAD_SIZE.L);

export async function refreshDatabase(download = false) {
  if(download){
    await downloadEDDB('systems_populated.jsonl').then(() => recreate_systems_populated_v6());
    await downloadEDDB('listings.csv').then(() => recreate_listings_v6());
    await downloadEDDB('stations.jsonl').then(() => recreate_stations_v6());
  } else {
    await recreate_systems_populated_v6();
    await recreate_listings_v6();
    await recreate_stations_v6();
  }
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

async function recreate_stations_v6() {
  exec_recreate('stations_v6');

  const systemsFile = BASE_FILE_LOC + 'stations.jsonl.gz';
  const rl = readline.createInterface({
    input: fs.createReadStream(systemsFile).pipe(zlib.createGunzip())
  });

  const prep = db.prepare('INSERT OR IGNORE INTO `stations_v6`(`id`, `system_id`, `max_landing_pad_size`, `distance_to_star`, `name`,  `is_planetary`, `full_json`) VALUES (?,?,?,?,?,?);');

  const insertMany = db.transaction((cats: {station: IStation, fulljson: string}[]) => {
    for (const item of cats) {
      const numeric_max_landing_pad_size = MLP_Mapping.get(item.station.max_landing_pad_size);
      const is_planetary = item.station.is_planetary ? 1 : 0;
      prep.run(item.station.id, item.station.system_id, numeric_max_landing_pad_size, item.station.distance_to_star, item.station.name, is_planetary, item.fulljson);
    }
  });

  let itemBuffer: {station: IStation, fulljson: string}[] = [];
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

async function recreate_listings_v6() {
  exec_recreate('listings_v6');
  const listingsFile = BASE_FILE_LOC + 'listings.csv.gz';
  const prep = db.prepare('INSERT OR IGNORE INTO `listings_v6`(id, station_id, commodity_id, supply, supply_bracket, buy_price, sell_price, demand, demand_bracket, collected_at) VALUES (?,?,?,?,?,?,?,?,?,?);');

  const insertMany = db.transaction((cats: IListing[]) => {
    for (const item of cats) {
      prep.run(item.id, item.station_id, item.commodity_id,
        item.supply, item.supply_bracket, item.buy_price,
        item.sell_price, item.demand, item.demand_bracket, item.collected_at);
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
  if(!fs.existsSync(filename)) {
    throw new Error('File does not exist ' + filename);
  }

  const recreate_listings = fs.readFileSync(filename, 'utf8');
  db.exec(recreate_listings);
}
