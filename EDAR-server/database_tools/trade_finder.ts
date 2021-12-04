import {db} from '..';
import fs from 'node:fs'
import {ITradeFinderResult} from '../models/ITradeFinderResult';

// const regex = new RegExp('/[\n\t]+/gm');
const query = fs.readFileSync(__dirname + '/sql/trade_finder.sql', 'utf8').replace(/[\n\t]+/gm, ' ');
enum MIN_PAD_SIZE {S, M, L}

export function findTrades(system: string, maxJumpRangeLY: number, target_system?: string, maxAgeDays?: number, minPadSize?: MIN_PAD_SIZE): void;
export function findTrades(system_id: number, maxJumpRangeLY: number, target_system?: number, maxAgeDays?: number, minPadSize?: MIN_PAD_SIZE): void;
export function findTrades(sys: number | string, maxJumpRangeLY: number, target_system?: string | number, maxAgeDays = 3, minPadSize = MIN_PAD_SIZE.S): void{

  let system_id = -1;
  let target_system_id = -1;
  let res: ITradeFinderResult[] = [];
  let current_query = query;
  const select_system_id_by_name_query = 'select systems_populated_v6.id from systems_populated_v6 where name = ?;';

  if(typeof sys === 'string') {
    const stmt = db.prepare<[system: string]>(select_system_id_by_name_query);
    system_id = stmt.get(sys).id;
  }

  // if we have a target system set
  if(target_system){
    if(typeof target_system === 'string') {
      const stmt = db.prepare<[system: string]>(select_system_id_by_name_query);
      target_system_id = stmt.get(target_system).id;
    } else {
      target_system_id = target_system;
    }
    current_query = current_query.replace('@@@TARGET_SYSTEM@@@', ` AND sp1.id = ${target_system_id} `)

  } else {
    // do nothing
    current_query = current_query.replace('@@@TARGET_SYSTEM@@@', ` `)
  }

  if(typeof sys === 'number') {
    system_id = sys;
  }

  const currentEpoch = Math.floor(new Date().getTime() / 1000); // seconds
  const maxAge = currentEpoch - maxAgeDays * 24 * 3600;

  const params = {system_id: system_id, max_range: maxJumpRangeLY * maxJumpRangeLY, max_age: maxAge};


  switch (minPadSize) {
  case MIN_PAD_SIZE.S:
    current_query = current_query.replace(/@pad_sizes/gm, '\'L\', \'M\', \'S\'')
    break;
  case MIN_PAD_SIZE.M:
    current_query = current_query.replace(/@pad_sizes/gm, '\'L\', \'M\'')
    break;
  case MIN_PAD_SIZE.L:
    current_query = current_query.replace(/@pad_sizes/gm, '\'L\'')
    break;

  default:
    break;
  }
  // console.info(current_query);
  const stmt = db.prepare(current_query);
  res = stmt.all(params);


  res.forEach((s) => {
    console.log(s);
  });
}
