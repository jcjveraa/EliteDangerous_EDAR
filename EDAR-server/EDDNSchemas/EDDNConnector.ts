import zlib from 'zlib';
import {Subscriber} from 'zeromq';
import {IEddnCommodity3} from './IEddnCommodity3';

import { db } from '..';
import fs from 'node:fs';
import { NODE_ENV_isDevelopment } from '../web_api/NODE_ENV_isDevelopment';
import { IEddnJournal1 } from './IEddnJournal1';
import { IEddnDockedEvent } from './IEddnDockedEvent';
import { IEddnMessage } from './IEddnMessage';
import { MIN_PAD_SIZE } from '../database_tools/FindTradeOptions';

const SOURCE_URL = 'tcp://eddn.edcd.io:9500';
// const log_file = fs.createWriteStream(__dirname + '/debug.log');

const insertStatement = db.prepare('INSERT OR IGNORE INTO `stations_v6`(`id`, `ed_market_id`, `system_id`, `max_landing_pad_size`, `distance_to_star`, `name`, `is_planetary`) VALUES (?,?,?,?,?,?, ?);');
const findStatement = db.prepare('select count() from station_id_lookup where station_name=? AND system_name=?');

async function processCommodityMessage(msg: IEddnCommodity3) {
  const message = msg.message;
  const ts = msg.header.gatewayTimestamp ? msg.header.gatewayTimestamp : Date.now();
  const collected_at = new Date(ts).getTime();
  const station_id = db.prepare('SELECT station_id from station_id_lookup where ed_market_id == ?')
    .get(message.marketId);

  if(station_id === undefined) {
    console.info('Did not find MarketId ', message.marketId, ' which should be in System:', message.systemName, 'Station:', message.stationName, message.commodities.length);
    return;
    // const prep = db.prepare('INSERT OR IGNORE INTO `stations_v6`(`id`, `ed_market_id`, `system_id`, `max_landing_pad_size`, `distance_to_star`, `name`, `is_planetary`) VALUES (?,?,?,?,?,?, ?);');
    // const newId = db.prepare('SELECT MAX(id)+1 AS max_id FROM stations_v6').get().max_id;
    // prep.run(newId, message.marketId, message.systemName,)
    // // return;
  }

  const commodityIdQuery = db.prepare('SELECT id from commodities_v6 where EDDN_name == ?');


  msg.message.commodities.forEach(commodity => {
    const commodityId = commodityIdQuery.get(commodity.name);
    if(commodityId === undefined){
      // commodity.
      // log_file.write(commodity.name + '\n');
      console.log(commodity.name, commodity.sellPrice, commodity.buyPrice, '\n');

      // console.log(commodity. + '\n');
    }
  });
}

const padSizeStore : {[k: string]: any[]} = {};

async function processJournalMessage(msg: IEddnJournal1) {
  const message = msg.message;

  // if(NODE_ENV_isDevelopment && message.event === 'Location')  console.log(msg);
  if(message.event === 'Docked') {
    processDockedEvent(msg);
  }
}

function processDockedEvent(msg: unknown) {
  const dockedMessage = msg as IEddnDockedEvent;
  const m = dockedMessage.message;
  // console.log(m.StationName, m.MarketID, m.StarPos, m.StarSystem);
  console.time('get station');
  const result = findStatement.get(m.StationName, m.StarSystem);
  console.timeEnd('get station');
  if (result === undefined) {
    console.log(`Station ${m.StationName} in ${m.StarSystem} was not found in the database!`);
  } else {
    // console.log(`Yay, station ${m.StationName} in ${m.StarSystem} is there. It is a ${m.StationType} with a landing pad of size ${findMaxLandingpad(dockedMessage)}.`);
    if (!padSizeStore[m.StationType]) {
      padSizeStore[m.StationType] = [];
    }
    const dockSize = findMaxLandingpad(dockedMessage);
    if (!padSizeStore[m.StationType].includes(dockSize))
      padSizeStore[m.StationType].push(dockSize);
    console.log(padSizeStore);
  }
}

function findMaxLandingpad(m: IEddnDockedEvent) {
  if(!m.message.LandingPads) return undefined;
  if(m.message.LandingPads.Large > 0) return MIN_PAD_SIZE.L;
  if(m.message.LandingPads.Medium > 0) return MIN_PAD_SIZE.M;
  return MIN_PAD_SIZE.S;
}

export async function run() {
  const sock = new Subscriber;

  sock.connect(SOURCE_URL);
  sock.subscribe('');
  console.log('EDDN listener connected to:', SOURCE_URL);

  for await (const [src] of sock) {
    const msg = JSON.parse(zlib.inflateSync(src).toString('utf8'));
    if (msg.$schemaRef === 'https://eddn.edcd.io/schemas/commodity/3') {
      // console.log(msg);
      // processCommodityMessage(msg as IEddnCommodity3);

    }

    if (msg.$schemaRef === 'https://eddn.edcd.io/schemas/journal/1') {
      // console.log(msg);
      processJournalMessage(msg as IEddnJournal1);

    }
  }
}

