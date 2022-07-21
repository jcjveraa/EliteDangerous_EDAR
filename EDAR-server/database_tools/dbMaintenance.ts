import { db } from '..';
import {calculateUnixEpochDaysAgo} from './FindTradeOptions';
import { ageOfListingsToKeep } from './db_updaters';
import { NODE_ENV_isDevelopment } from '../web_api/NODE_ENV_isDevelopment';

export async function maintainListings(){
  if(NODE_ENV_isDevelopment) console.time('Cleaning up the database, removing inactive items...');
  const min_epoch_to_keep = calculateUnixEpochDaysAgo(ageOfListingsToKeep);
  const listingsCleanupQuery = 'DELETE FROM listings_v6 WHERE listings_v6.collected_at < @min_epoch_to_keep;';
  db.prepare(listingsCleanupQuery).run({min_epoch_to_keep: min_epoch_to_keep});
  
  // Doesn't seem to add much value as it's only 30 MB of data, while keeping the data means keeping sometimes valueable info about stations etc.
  /*
  const stationAndSystemCleanupQuery = [
    'DELETE FROM stations_v6 WHERE stations_v6.id NOT IN (SELECT listings_v6.station_id from listings_v6);', 
    'DELETE FROM systems_populated_v6 WHERE systems_populated_v6.id NOT IN (SELECT stations_v6.id from stations_v6);'];
  
  stationAndSystemCleanupQuery.forEach((q) => db.exec(q));
   */ 
  db.exec('VACUUM;');
  if(NODE_ENV_isDevelopment) console.timeEnd('Cleaning up the database, removing inactive items...');
}


