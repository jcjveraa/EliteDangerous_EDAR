import { db } from '..';
import {ITradeFinderResult, ITradeFinderResultWithNames} from '../models/ITradeFinderResult';

interface IIdNameMap { [id: number]: string; }
export function appendStationAndSystemNames_v2(resultset: ITradeFinderResult[]): ITradeFinderResultWithNames[] {
  const sys_ids = [];
  const stat_ids = [];

  const updatedresultset: ITradeFinderResultWithNames[] = [];

  for (let index = 0; index < resultset.length; index++) {

    const element = resultset[index];
    sys_ids.push(element.buy_from_system_id);
    sys_ids.push(element.sell_to_system_id);

    stat_ids.push(element.sell_to_station_id);
    stat_ids.push(element.buy_from_station_id);
  }


  const station_name_query = db.prepare('select id, name from stations_v6 where id in (' + stat_ids.join(',') + ')');
  const system_name_query = db.prepare('select id, name from systems_populated_v6 where id in (' + sys_ids.join(',') + ')');

  const statResult: { id: number; name: string; }[] = station_name_query.all();
  const statMap: IIdNameMap = {};
  statResult.forEach(element => {
    statMap[element.id] = element.name;
  });

  const sysResult: { id: number; name: string; }[] = system_name_query.all();
  const sysMap: IIdNameMap = {};
  sysResult.forEach(element => {
    sysMap[element.id] = element.name;
  });

  for (let index = 0; index < resultset.length; index++) {
    const element: ITradeFinderResultWithNames = resultset[index] as ITradeFinderResultWithNames;
    element.buy_from_station_name = statMap[element.buy_from_station_id];
    element.buy_from_system_name = sysMap[element.buy_from_system_id];
    element.sell_to_station_name = statMap[element.sell_to_station_id];
    element.sell_to_system_name = sysMap[element.sell_to_system_id];
    updatedresultset.push(element);
  }

  return updatedresultset;
}
