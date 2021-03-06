import { db } from '..';
export enum MIN_PAD_SIZE { S, M, L }


export class FindTradeOptions {

  minPadSize: MIN_PAD_SIZE = MIN_PAD_SIZE.S;
  maxAgeDays = 3;
  currentStation: number|undefined = undefined;
  allowPlanetary: boolean;
  two_way = true;
  cargoSpaceAvailable: number;
  fundsAvailable: number;
  currentSystemId: number;
  maxJumpRangeLY: number;

  public getMaxAgeSeconds() {
    return calculateUnixEpochDaysAgo(this.maxAgeDays);
  }

  /***
   *
   */
  constructor(currentSystem: number | string, maxJumpRangeLY: number, fundsAvailable: number, cargoSpaceAvailable: number, allowPlanetary = false) {
    this.cargoSpaceAvailable = cargoSpaceAvailable;
    this.fundsAvailable = fundsAvailable;
    this.maxJumpRangeLY = maxJumpRangeLY;
    this.allowPlanetary = allowPlanetary;
    const curSys = systemNameToId(currentSystem);
    if (!curSys) {
      // console.error(`Could not find system id/name ${currentSystem} in the database!`);
      throw new Error(`Could not find system id/name ${currentSystem} in the database!`);
    }
    this.currentSystemId = curSys;

  }
}

export function calculateUnixEpochDaysAgo(days: number) {
  return (calculateUnixEpoch() - days * 24 * 3600);
}

export function calculateUnixEpoch() {
  return Math.floor(new Date().getTime() / 1000); // seconds
}

export function systemNameToId(value: string | number): number {
  const select_system_id_by_name_query = 'select systems_populated_v6.id from systems_populated_v6 where name = ?;';
  let result = -1;
  if (typeof value === 'string') {
    const stmt = db.prepare<[system: string]>(select_system_id_by_name_query);
    result = stmt.get(value).id;
  } else {
    result = value;
  }

  return result;
}
