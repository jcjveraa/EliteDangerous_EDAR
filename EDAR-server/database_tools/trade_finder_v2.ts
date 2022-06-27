import fs from 'node:fs'
import {db} from '..';
import {FindTradeOptions} from './FindTradeOptions';

// const regex = new RegExp('/[\n\t]+/gm');
const systems_in_range_base_query = loadAndCleanSQL('/revised_sql/systems_in_range.sql');
const stations_in_range_base_query = loadAndCleanSQL('/revised_sql/stations_in_range.sql');
const listings_in_range_base_query = loadAndCleanSQL('/revised_sql/listings_in_range.sql');
const listings_in_current_system_base_query = loadAndCleanSQL('/revised_sql/listings_in_current_system.sql');
const trades_available_base_query = loadAndCleanSQL('/revised_sql/trades_available.sql');
const trades_selected_in_system_base_query = loadAndCleanSQL('/revised_sql/trades_selected_in_system.sql');
const temp_db_removal_base_query = loadAndCleanSQL('/revised_sql/temp_db_removal.sql');

function loadAndCleanSQL(filename: string) {
  return fs.readFileSync(__dirname + filename, 'utf8').replace(/[\n\t]+/gm, ' ');
}

export function findTrades_v2(opts: FindTradeOptions) {
  const unique_table_name = '_' + (Math.random().toString(36) + Math.random().toString(36)).replace(/[^a-z]+/g, '');

  const systems_in_range = table_name_replacer(unique_table_name, systems_in_range_base_query);
  const stations_in_range = table_name_replacer(unique_table_name, stations_in_range_base_query);
  const listings_in_current_system = table_name_replacer(unique_table_name, listings_in_current_system_base_query);
  const listings_in_range = table_name_replacer(unique_table_name, listings_in_range_base_query);
  const trades_available = table_name_replacer(unique_table_name, trades_available_base_query);
  const trades_selected_in_system = table_name_replacer(unique_table_name, trades_selected_in_system_base_query);
  const temp_db_removal = table_name_replacer(unique_table_name, temp_db_removal_base_query);


  // const res: ITradeFinderResult[] = [];

  const params = {current_system_id: opts.currentSystemId,
    allow_planetary: opts.allowPlanetary,
    max_range: Math.pow(opts.maxJumpRangeLY, 2),
    landing_pad_size: opts.minPadSize,
    current_station_id: opts.currentStation,
    limit: 5,
    funds_available: opts.fundsAvailable,
    max_cargo_space: opts.cargoSpaceAvailable,
    max_age: opts.getMaxAgeSeconds()};
  db.prepare(systems_in_range).run(params);
  db.prepare(stations_in_range).run(params);
  db.prepare(listings_in_range).run(params);
  db.prepare(listings_in_current_system).run(params);
  db.prepare(trades_available).run(params);
  const result = db.prepare(trades_selected_in_system).all(params);

  db.exec(temp_db_removal);

  return result;
}


function table_name_replacer(random_string: string, current_query: string) {
  return current_query.replace(/_XYZZYX/g, random_string);
}


