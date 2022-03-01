console.time('loaded up in');
import Sqlite from 'better-sqlite3';
import {refreshDatabase} from './database_tools/db_updaters';
import {FindTradeOptions} from './database_tools/FindTradeOptions';
import {findTrades, MIN_PAD_SIZE} from './database_tools/trade_finder';


export const db: Sqlite.Database = Sqlite('EDAR.sqlite3');
// db.pragma('journal_mode = WAL');

// refreshDatabase(true);
console.timeEnd('loaded up in');
console.time('Found a trade in');
const tradeOpts = new FindTradeOptions('LHS 3447', 10, 100000, 16);
tradeOpts.minPadSize = MIN_PAD_SIZE.L;
let trade = findTrades(tradeOpts);
// let returnTrade = undefined;
// if(trade) {
//   returnTrade = findReturnTrade(trade.buy_station_id, trade.)
// }
console.log(trade);
tradeOpts.two_way = false;
trade = findTrades(tradeOpts);
console.log(trade);
console.timeEnd('Found a trade in');
