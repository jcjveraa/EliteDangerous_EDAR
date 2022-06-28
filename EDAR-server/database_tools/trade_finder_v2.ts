import fs from 'node:fs'
import {db} from '..';
import {ITradeFinderResult} from '../models/ITradeFinderResult';
import {FindTradeOptions} from './FindTradeOptions';

const systems_in_range_base_query = loadAndCleanSQL('/revised_sql/systems_in_range.sql');
const stations_in_range_base_query = loadAndCleanSQL('/revised_sql/stations_in_range.sql');
const listings_in_range_base_query = loadAndCleanSQL('/revised_sql/listings_in_range.sql');
const listings_in_current_system_base_query = loadAndCleanSQL('/revised_sql/listings_in_current_system.sql');
const trades_available_base_query = loadAndCleanSQL('/revised_sql/trades_available.sql');
const trades_selected_in_system_base_query = loadAndCleanSQL('/revised_sql/trades_selected_in_system.sql');
const trades_selected_from_station_base_query = loadAndCleanSQL('/revised_sql/trades_selected_from_station.sql');
const temp_db_removal_base_query = loadAndCleanSQL('/revised_sql/temp_db_removal.sql');

function loadAndCleanSQL(filename: string) {
  return fs.readFileSync(__dirname + filename, 'utf8').replace(/[\n\t]+/gm, ' ');
}

// export function findTradeChain(numberOfHops: number) {

// }

export function findTradesInSystem_v2(opts: FindTradeOptions): ITradeFinderResult[] {
  const unique_table_postfix = generateTablePostfix();
  const trades_selected_in_system = table_name_replacer(unique_table_postfix, trades_selected_in_system_base_query);

  const params = getQueryParametersFromTradeOptions(opts);
  setup_temp_databases(unique_table_postfix, params);

  const result = db.prepare(trades_selected_in_system).all(params);

  cleanup(unique_table_postfix);
  return result;
}

export function findTradesFromStation_v2(opts: FindTradeOptions): ITradeFinderResult[] {
  const unique_table_postfix = generateTablePostfix();
  const trades_selected_from_station = table_name_replacer(unique_table_postfix, trades_selected_from_station_base_query);

  const params = getQueryParametersFromTradeOptions(opts);
  setup_temp_databases(unique_table_postfix, params);

  const result = db.prepare(trades_selected_from_station).all(params);

  cleanup(unique_table_postfix);
  return result;
}

function getQueryParametersFromTradeOptions(opts: FindTradeOptions): IQueryParameters {
  return {
    current_system_id: opts.currentSystemId,
    allow_planetary: opts.allowPlanetary ? 1 : 0,
    max_range: Math.pow(opts.maxJumpRangeLY, 2),
    landing_pad_size: opts.minPadSize,
    current_station_id: opts.currentStation,
    limit: 5,
    funds_available: opts.fundsAvailable,
    max_cargo_space: opts.cargoSpaceAvailable,
    max_age: opts.getMaxAgeSeconds()
  };
}

interface IQueryParameters {
    current_system_id: number;
    allow_planetary: number;
    max_range: number;
    landing_pad_size: number;
    current_station_id: number | undefined;
    limit: number;
    funds_available: number;
    max_cargo_space: number;
    max_age: number;
}

function generateTablePostfix() {
  // TODO probably there is a standard way of doing this... UUID meant another library though
  return '_' + (Math.random().toString(36) + Math.random().toString(36)).replace(/[^a-z]+/g, '');
}

function table_name_replacer(unique_table_postfix: string, current_query: string) {
  return current_query.replace(/_XYZZYX/g, unique_table_postfix);
}

function setup_temp_databases(unique_table_postfix: string, params: any) {
  const systems_in_range = table_name_replacer(unique_table_postfix, systems_in_range_base_query);
  const stations_in_range = table_name_replacer(unique_table_postfix, stations_in_range_base_query);
  const listings_in_current_system = table_name_replacer(unique_table_postfix, listings_in_current_system_base_query);
  const listings_in_range = table_name_replacer(unique_table_postfix, listings_in_range_base_query);
  const trades_available = table_name_replacer(unique_table_postfix, trades_available_base_query);

  db.prepare(systems_in_range).run(params);
  db.prepare(stations_in_range).run(params);
  db.prepare(listings_in_range).run(params);
  db.prepare(listings_in_current_system).run(params);
  db.prepare(trades_available).run(params);
}

function cleanup(unique_table_postfix: string) {
  const temp_db_removal = table_name_replacer(unique_table_postfix, temp_db_removal_base_query);
  db.exec(temp_db_removal);
}
