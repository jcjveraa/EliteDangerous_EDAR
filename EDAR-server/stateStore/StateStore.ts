import { db } from '../index';
import NODE_ENV_isDevelopment from '../web_api/NODE_ENV_isDevelopment';

export async function push(state_uuid: string, attempt = 0): Promise<boolean> {
  if (attempt === 10) {
    console.error('Inserting into state table failed 10 times, ceasing to try...');
    return false;
  }
  const query = db.prepare('INSERT INTO `EDAR_state` (`uuid`,`created_at`,`last_seen`) VALUES (?,?,?)')
  const result = query.run(state_uuid, Date.now(), Date.now());
  if (result.changes !== 1) {
    console.warn('Inserting into state table failed, retrying...');
    return await push(state_uuid, attempt + 1);
  }
  cleanStateTable(); // Ensure cleanup is ran frequently
  return true;
}

export async function includes(state_uuid: string) {
  const query = db.prepare('SELECT FROM `EDAR_state` WHERE `uuid`=?');
  const result = query.all(state_uuid);

  return result.length === 1;
}

export async function updateLastSeen(state_uuid: string) {
  const query = db.prepare('UPDATE `EDAR_state` SET `last_seen`=? WHERE `uuid`=?');
  const result = query.run(state_uuid, Date.now());
  if (result.changes !== 1) {
    console.warn('Updating the state table failed!');
  }
}

export async function numberOfUsers() {
  const query = db.prepare('SELECT COUNT(`uuid`) FROM `EDAR_state`');
  const result = query.get();
  if (NODE_ENV_isDevelopment) {
    console.log(result);
  }
}

async function cleanStateTable() {
  const ten_minutes_ago_milis = Date.now() - (10 * 60 * 1000);
  const cleanupQuery = 'DELETE FROM `EDAR_state` where `last_seen` < ' + ten_minutes_ago_milis;
  db.exec(cleanupQuery);
}
