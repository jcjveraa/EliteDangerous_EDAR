import zlib from 'zlib';
import {Subscriber} from 'zeromq';
import {IEddnCommodity3} from './EDDNSchemas/IEddnCommodity3';
import {IListing} from './models/IListing';
import {calculateUnixEpoch} from './database_tools/FindTradeOptions';
import { db } from '.';
import fs from 'node:fs';

const SOURCE_URL = 'tcp://eddn.edcd.io:9500';
const log_file = fs.createWriteStream(__dirname + '/debug.log');

async function processMessage(msg: IEddnCommodity3) {
  const collected_at = calculateUnixEpoch();
  const station_id = db.prepare('SELECT station_id from station_id_lookup where ed_market_id == ?')
    .get(msg.message.marketId);

  if(station_id === undefined) {
    console.warn('Did not find MarketId ', msg.message.marketId, ' which should be in System:', msg.message.systemName, 'Station:', msg.message.stationName, msg.message.commodities.length);
    return;
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

export async function run() {
  const sock = new Subscriber;

  sock.connect(SOURCE_URL);
  sock.subscribe('');
  console.log('EDDN listener connected to:', SOURCE_URL);

  for await (const [src] of sock) {
    const msg = JSON.parse(zlib.inflateSync(src).toString('utf8')) as IEddnCommodity3;
    if (msg.$schemaRef === 'https://eddn.edcd.io/schemas/commodity/3') {
      // console.log(msg);
      processMessage(msg);

    }
  }
}

