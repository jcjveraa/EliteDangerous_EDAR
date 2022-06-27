import fs from 'node:fs'
import {ITradeFinderResult} from '../models/ITradeFinderResult';
import {FindTradeOptions} from './FindTradeOptions';

// const regex = new RegExp('/[\n\t]+/gm');
const query = fs.readFileSync(__dirname + '/sql/trade_finder.sql', 'utf8').replace(/[\n\t]+/gm, ' ');
const query_temp_table = fs.readFileSync(__dirname + '/sql/temp_table_station_distances.sql', 'utf8').replace(/[\n\t]+/gm, ' ');
const query_return = fs.readFileSync(__dirname + '/sql/trade_finder_return.sql', 'utf8').replace(/[\n\t]+/gm, ' ');

export enum MIN_PAD_SIZE {S, M, L}

export function findTrades_v2(opts: FindTradeOptions, returnTrade = false): ITradeFinderResult | undefined{

  const res: ITradeFinderResult[] = [];

}

function findFirstTrade_v2(opts: FindTradeOptions) {


  return result;
}

export function findReturnTrade_v2(opts: FindTradeOptions){


}
