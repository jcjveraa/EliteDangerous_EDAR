import {db} from '..';
import {MIN_PAD_SIZE} from './trade_finder';

export class FindTradeOptions {

  minPadSize: MIN_PAD_SIZE = MIN_PAD_SIZE.S;
  maxAgeDays = 3;
  targetStation? = -1;
  currentStation? = -1;
  two_way = true;
  private _targetSytem: number | undefined = undefined;
  public get targetSytem(): number | undefined {
    return this._targetSytem;
  }
  public set targetSytem(value: number | string | undefined) {
    if (value) {
      value = systemNameToId(value);
      this._targetSytem = value;
    }
  }
  cargoSpaceAvailable: number;
  fundsAvailable: number;
  currentSystemId: number;
  maxJumpRangeLY: number;

  public getMaxAgeSeconds() {
    const currentEpoch = Math.floor(new Date().getTime() / 1000); // seconds
    return currentEpoch - this.maxAgeDays * 24 * 3600;
  }

  /***
   *
   */
  constructor(currentSystem: number | string, maxJumpRangeLY: number, fundsAvailable: number, cargoSpaceAvailable: number) {
    this.cargoSpaceAvailable = cargoSpaceAvailable;
    this.fundsAvailable = fundsAvailable;
    this.maxJumpRangeLY = maxJumpRangeLY;
    const curSys = systemNameToId(currentSystem);
    if (!curSys) {
      // console.error(`Could not find system id/name ${currentSystem} in the database!`);
      throw new Error(`Could not find system id/name ${currentSystem} in the database!`);
    }
    this.currentSystemId = curSys;

  }
}


export function systemNameToId(value: string | number): number | undefined {
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
