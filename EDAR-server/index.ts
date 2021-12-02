
import Sqlite from 'better-sqlite3';
import {refreshDatabase} from './database_tools/db_updaters';
import {getSytemsInReach} from './database_tools/jump_distance';


export const db: Sqlite.Database = Sqlite('EDAR.sqlite3');
// db.pragma('journal_mode = WAL');

// refreshDatabase();

getSytemsInReach('LHS 3447', 10);
getSytemsInReach(12024, 10);
