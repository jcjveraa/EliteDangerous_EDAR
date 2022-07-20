import { db } from '..';
import {calculateUnixEpochDaysAgo} from './FindTradeOptions';
import { addMaintainer } from '../maintenance/Maintenance';

async function maintainListings(){
  const min_epoch_to_keep = calculateUnixEpochDaysAgo(14);
  const query = 'delete from listings_v6 where listings_v6.collected_at < @min_epoch_to_keep;';
  db.prepare(query).run({min_epoch_to_keep: min_epoch_to_keep});
  db.exec('VACUUM;');
}

addMaintainer(maintainListings);
