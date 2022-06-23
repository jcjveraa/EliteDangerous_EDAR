import {db} from '..';
import fs from 'node:fs'
import {ITradeFinderResult} from '../models/ITradeFinderResult';
import {FindTradeOptions} from './FindTradeOptions';
import { v4 as uuidv4 } from 'uuid';

// const regex = new RegExp('/[\n\t]+/gm');
const query = fs.readFileSync(__dirname + '/sql/trade_finder.sql', 'utf8').replace(/[\n\t]+/gm, ' ');
const query_temp_table = fs.readFileSync(__dirname + '/sql/temp_table_station_distances.sql', 'utf8').replace(/[\n\t]+/gm, ' ');
const query_return = fs.readFileSync(__dirname + '/sql/trade_finder_return.sql', 'utf8').replace(/[\n\t]+/gm, ' ');

export enum MIN_PAD_SIZE {S, M, L}

export function findTrades(opts: FindTradeOptions, returnTrade = false): ITradeFinderResult | undefined{

  let res: ITradeFinderResult[] = [];

  if(!returnTrade) {
    res = findFirstTrade(opts);
  } else {
    res = findReturnTrade(opts);
  }

  let bestResult: ITradeFinderResult | undefined = undefined;
  // let bestResultTwoWay: ITradeFinderResult | undefined = undefined;
  const fullResults: ITradeFinderResult[] = [];

  res.forEach((s) => {
    const maxUnitsPriceLimit = Math.floor(opts.fundsAvailable / s.buy_price);
    const maxUnitsCargospaceLimit = opts.cargoSpaceAvailable;
    const units = Math.min(maxUnitsCargospaceLimit, maxUnitsPriceLimit);
    const totalProfit = s.profit_per_unit * units;
    s.jump_distance_LY = Math.sqrt(s.jump_distance_LY_Squared);

    s.maxAttainableOneWay = {units: units, totalProfit: totalProfit};

    if(!returnTrade && opts.two_way) {
      const returnOpts: FindTradeOptions = new FindTradeOptions(s.sell_system_id, opts.maxJumpRangeLY, opts.fundsAvailable + totalProfit, opts.cargoSpaceAvailable);
      // Flip around sell & buy as this is the return leg
      returnOpts.currentStation = s.sell_station_id;
      returnOpts.targetStation = s.buy_station_id;
      s.returnTrade = findTrades(returnOpts, true);
      // let twoWayProfit = 0;
      if(s.returnTrade?.maxAttainableOneWay) {
        s.maxAttainableTwoWayProfit = s.maxAttainableOneWay.totalProfit + s.returnTrade?.maxAttainableOneWay?.totalProfit;
      }
      if(s.maxAttainableTwoWayProfit && bestResult?.maxAttainableTwoWayProfit && bestResult?.maxAttainableTwoWayProfit < s.maxAttainableTwoWayProfit) {
        bestResult = s;
      }

      if(!bestResult) {
        bestResult = s;
      } else if(bestResult.maxAttainableOneWay?.totalProfit && s.maxAttainableOneWay.totalProfit > bestResult.maxAttainableOneWay?.totalProfit) {
        bestResult = s;
      }
    } else {
    // console.log(s);
      if(!bestResult) {
        bestResult = s;
      } else if(bestResult.maxAttainableOneWay?.totalProfit && s.maxAttainableOneWay.totalProfit > bestResult.maxAttainableOneWay?.totalProfit) {
        bestResult = s;
      }
    }

    fullResults.push(s);
  });

  // if(!returnTrade && opts.two_way) {
  //   fullResults.sort((a, b) => {
  //     if(a.maxAttainableTwoWayProfit && b.maxAttainableTwoWayProfit) {
  //       return a.maxAttainableTwoWayProfit - b.maxAttainableTwoWayProfit
  //     } else {
  //       return (a.commodity_id - b.commodity_id); ///
  //     }
  //   })
  //   console.log(fullResults);
  // }

  return bestResult;
}

function findFirstTrade(opts: FindTradeOptions) {
  let current_query = query;
  // TARGET SYSTEM replacer
  // if we have a target system set
  current_query = targetSystemReplacer(opts.targetSytem, current_query);

  const params = {system_id: opts.currentSystemId, max_range: Math.pow(opts.maxJumpRangeLY, 2), max_age:  opts.getMaxAgeSeconds()};
  current_query = padSizeReplacer(opts.minPadSize, current_query);
  

  let unique_table_name = (Math.random().toString(36) + Math.random().toString(36)).replace(/[^a-z]+/g, '');
  current_query = table_name_replacer(unique_table_name, current_query);

  let temp_table_query = targetSystemReplacer(opts.targetSytem, query_temp_table);
  temp_table_query = table_name_replacer(unique_table_name, temp_table_query);
  temp_table_query = padSizeReplacer(opts.minPadSize, temp_table_query);

  // console.info(temp_table_query);

  const stmt_tmp = db.prepare(temp_table_query);
  stmt_tmp.run(params);

  const stmt = db.prepare(current_query);

  const result: ITradeFinderResult[] = stmt.all(params);

  db.exec('drop table if exists '+unique_table_name+';');
  return result;
}

export function findReturnTrade(opts: FindTradeOptions){
  let res: ITradeFinderResult[] = [];
  if(opts.currentStation && opts.targetStation) {
    const params = {original_station: opts.currentStation, target_station: opts.targetStation};
    const stmt = db.prepare(query_return);
    res = stmt.all(params);
    return res;
  } else {
    throw new Error(`Missing currentstation and/or targetstation in ${opts}`);

  }


}

function padSizeReplacer(minPadSize: MIN_PAD_SIZE, current_query: string) {
  switch (minPadSize) {
  case MIN_PAD_SIZE.S:
    current_query = current_query.replace(/@pad_sizes/gm, '0');
    break;
  case MIN_PAD_SIZE.M:
    current_query = current_query.replace(/@pad_sizes/gm, '1');
    break;
  case MIN_PAD_SIZE.L:
    current_query = current_query.replace(/@pad_sizes/gm, '2');
    break;

  default:
    break;
  }
  return current_query;
}

function targetSystemReplacer(target_system_id: number| undefined, current_query: string) {
  if (target_system_id) {
    return current_query.replace('@@@TARGET_SYSTEM@@@', ` AND sp1.id = ${target_system_id} `);
  }
  return current_query.replace('@@@TARGET_SYSTEM@@@', ` `);
}

function table_name_replacer(uuid: string, current_query: string) {

    return current_query.replace('@@@TEMP_TABLE_NAME@@@', uuid);

}

