console.time('loaded up in');
import Sqlite from 'better-sqlite3';
import {refreshDatabase} from './database_tools/db_updaters';
import {FindTradeOptions} from './database_tools/FindTradeOptions';
// import {findTrades, MIN_PAD_SIZE} from './database_tools/trade_finder';
import {findTradesInSystem_v2} from './database_tools/trade_finder_v2';

const refresh_db = false;
const download_source_from_EDDB = false;

export const db: Sqlite.Database = Sqlite('EDAR.sqlite3');


if (refresh_db) {
  // db.pragma('journal_mode = WAL');
  refreshDatabase(download_source_from_EDDB);
} else {
  console.timeEnd('loaded up in');
  console.time('full_run');
  const tradeOpts = new FindTradeOptions('LHS 3447', 10, 500000, 50);

  console.time('Found a one-way trade in');
  const trade = findTradesInSystem_v2(tradeOpts);
  console.log(trade);
  console.timeEnd('Found a one-way trade in');
  console.timeEnd('full_run');
}
