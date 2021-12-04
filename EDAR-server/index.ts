
import Sqlite from 'better-sqlite3';
import {refreshDatabase} from './database_tools/db_updaters';
import {getSytemsInReach} from './database_tools/jump_distance';
import {findTrades} from './database_tools/trade_finder';


export const db: Sqlite.Database = Sqlite('EDAR.sqlite3');
// db.pragma('journal_mode = WAL');

// refreshDatabase(false);

// getSytemsInReach('LHS 3447', 10);
// getSytemsInReach(12024, 10);


// findTrades('LHS 3447', 10);
// findTrades(12024, 10);
findTrades('LHS 3447', 10, 'Eravate');
