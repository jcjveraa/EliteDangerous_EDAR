import fs from 'node:fs';

export function loadSqlStringFromFile(filename: string) {
  return fs.readFileSync(__dirname + filename, 'utf8');
}
