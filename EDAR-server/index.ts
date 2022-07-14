import express from 'express';
import cors from 'cors';
import getSystemNames from './web_api/getSystemNames'
export const app = express();
import dotenv from 'dotenv'

dotenv.config();

console.time('loaded up in');
import Sqlite from 'better-sqlite3';
import {refreshDatabase} from './database_tools/db_updaters';
import {FindTradeOptions, systemNameToId} from './database_tools/FindTradeOptions';
// import {findTrades, MIN_PAD_SIZE} from './database_tools/trade_finder';
import {findTradeChain} from './database_tools/trade_finder_v2';
import {run} from './EDDNConnector';


const refresh_db = false;
const download_source_from_EDDB = false;

export const db: Sqlite.Database = Sqlite('EDAR.sqlite3');


if (refresh_db) {
  // db.pragma('journal_mode = WAL');
  refreshDatabase(download_source_from_EDDB);
} else {
  // console.timeEnd('loaded up in');
  // const tradeOpts = new FindTradeOptions('Frigaha', 10, 500000, 50, false);
  // console.time('chain');
  // const chainTrade = findTradeChain(3, tradeOpts);
  // console.log(chainTrade);
  // console.timeEnd('chain');

}

if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
}

app.use('/api/SystemNameAutocomplete', getSystemNames);

app.get('/api/findTradeBySystemName/:systemName', (req, res) => {
  let sysId = -1;
  try {
    sysId = systemNameToId(req.params.systemName);
    // console.log(sysId);
    const tradeOpts = new FindTradeOptions(sysId, 10, 500000, 50, false);
    res.json(findTradeChain(3, tradeOpts)).send();
  } catch (error) {
    console.error(error);
    res.sendStatus(404);
  }
})

app.listen(process.env.API_PORT, () => {
  console.log(`EDAR listening on port ${process.env.API_PORT} in ${process.env.NODE_ENV} mode`)
})

// run();
