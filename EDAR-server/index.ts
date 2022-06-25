console.time('loaded up in');
import Sqlite from 'better-sqlite3';
import {refreshDatabase} from './database_tools/db_updaters';
import {FindTradeOptions} from './database_tools/FindTradeOptions';
import {findTrades, MIN_PAD_SIZE} from './database_tools/trade_finder';

const refresh_db = false;

export const db: Sqlite.Database = Sqlite('EDAR.sqlite3');

if (refresh_db) {
  db.pragma('journal_mode = WAL');
  refreshDatabase();
} else {
  console.timeEnd('loaded up in');
  console.time('Found a two-way trade in');
  const tradeOpts = new FindTradeOptions('LHS 3447', 10, 100000, 16);
  tradeOpts.minPadSize = MIN_PAD_SIZE.S;
  let trade = findTrades(tradeOpts);

  console.log(trade);
  console.timeEnd('Found a two-way trade in');

  console.time('Found a trade in');
  tradeOpts.two_way = false;
  trade = findTrades(tradeOpts);
  console.log(trade);
  console.timeEnd('Found a trade in');
}
