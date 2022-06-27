import {db} from '..';
import fs from 'node:fs'

const query_by_id = fs.readFileSync(__dirname + '/sql/jump_distance_by_id.sql', 'utf8').replace('\n', ' ');
const query_by_name = fs.readFileSync(__dirname + '/sql/jump_distance_by_name.sql', 'utf8').replace('\n', ' ');

export function getSytemsInReach(system: string, maxJumpRangeLY: number): void;
export function getSytemsInReach(system_id: number, maxJumpRangeLY: number): void;
export function getSytemsInReach(sys: number | string, maxJumpRangeLY: number): void{

  let res: {id: number, distance_squared: number}[] = [];

  if(typeof sys === 'number') {
    const stmt = db.prepare<[system_id: number, distanceSquared: number]>(query_by_id);
    res = stmt.all(sys, maxJumpRangeLY * maxJumpRangeLY);
  }

  if(typeof sys === 'string') {
    const stmt = db.prepare<[system_id: string, distanceSquared: number]>(query_by_name);
    res = stmt.all(sys, maxJumpRangeLY * maxJumpRangeLY);
  }

  res.forEach((s) => {
    console.log(s, s.id, Math.sqrt(s.distance_squared));
  });
}
