console.time('loaded up in');
import Sqlite from 'better-sqlite3';
import {refreshDatabase} from './database_tools/db_updaters';
import {FindTradeOptions} from './database_tools/FindTradeOptions';
// import {findTrades, MIN_PAD_SIZE} from './database_tools/trade_finder';
import {findTradeChain} from './database_tools/trade_finder_v2';

const refresh_db = false;
const download_source_from_EDDB = false;

export const db: Sqlite.Database = Sqlite('EDAR.sqlite3');


if (refresh_db) {
  // db.pragma('journal_mode = WAL');
  refreshDatabase(download_source_from_EDDB);
} else {
  console.timeEnd('loaded up in');
  // console.time('full_run');
  const tradeOpts = new FindTradeOptions('Frigaha', 10, 500000, 50, false);

  // console.time('Found a one-way trade in');
  // const trade = findTradesInSystem_v2(tradeOpts);

  // console.timeEnd('Found a one-way trade in');
  // console.timeEnd('full_run');
  // console.log(trade);

  console.time('chain');
  const chainTrade = findTradeChain(3, tradeOpts);
  console.log(chainTrade);
  console.timeEnd('chain');

}
