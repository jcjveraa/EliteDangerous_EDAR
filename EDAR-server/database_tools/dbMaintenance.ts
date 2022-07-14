import {db} from '..';
import {calculateUnixEpochDaysAgo} from './FindTradeOptions';
import fs from 'node:fs'

export async function maintainDb(){
  const min_epoch_to_keep = calculateUnixEpochDaysAgo(14);
  const query = fs.readFileSync(__dirname + '/sql/listings_table_cleanup.sql', 'utf8');
  db.prepare(query).run({min_epoch_to_keep: min_epoch_to_keep})
  db.exec('VACUUM;')
}
