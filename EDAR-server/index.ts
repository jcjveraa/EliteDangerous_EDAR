import dotenv from 'dotenv';
dotenv.config();
import {NODE_ENV_isDevelopment, NODE_ENV_isTest } from './web_api/NODE_ENV_isDevelopment';
import Sqlite from 'better-sqlite3';
export const db: Sqlite.Database = Sqlite('EDAR.sqlite3');

if (NODE_ENV_isTest) { process.env.API_PORT = '0'; }

import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import cors from 'cors';
import getSystemNames from './web_api/getSystemNames';
export const app = express();
import session from 'express-session';

console.time('loaded up in');

import { refreshDatabase } from './database_tools/db_updaters';
import { FindTradeOptions, systemNameToId } from './database_tools/FindTradeOptions';
// import {findTrades, MIN_PAD_SIZE} from './database_tools/trade_finder';
import { findTradeChain } from './database_tools/trade_finder_v2';
import OAuth from './web_api/OAuth';
import OAuthTest from './oauth_test/OAuthTest';
import getPlayerLocation from './web_api/getPlayerLocation';
import webClient from './web_api/webClient';
import { sessionSettings } from './web_api/CookieSettings';
app.disable('x-powered-by');

const refresh_db = false;
const download_source_from_EDDB = false;



app.use(session(
  sessionSettings
));
app.use(compression()); //TODO check if required when hosting behind nginx

if (refresh_db) {
  // db.pragma('journal_mode = WAL');
  refreshDatabase(download_source_from_EDDB);
} else {
  // console.timeEnd('loaded up in');
  // const tradeOpts = new FindTradeOptions('Frigaha', 10, 500000, 50, false);
  // console.time('chain');
  // const chainTrade = findTradeChain(3, tradeOpts);
  // console.log(chainTrade);
  // console.timeEnd('chain');

}

if (NODE_ENV_isDevelopment) {
  console.warn('Cors enabled!');
  app.use(cors());
}


app.use('/api/SystemNameAutocomplete', getSystemNames);
app.use('/api/FrontierApi', OAuth);

if (NODE_ENV_isDevelopment) {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/', OAuthTest);
}

app.use('/api/capi', getPlayerLocation);
app.use('/api/webclient', webClient);

app.get('/api/bySystemName/:systemName', (req, res) => {
  let sysId = -1;
  try {
    sysId = systemNameToId(req.params.systemName);
    console.log(sysId);
    const tradeOpts = new FindTradeOptions(sysId, 10, 500000, 50, false);
    res.json(findTradeChain(3, tradeOpts)).send();
  } catch (error) {
    res.sendStatus(404);
  }
});

export const server = app.listen(process.env.API_PORT, () => {
  console.log(`EDAR listening on port ${process.env.API_PORT}`);
});

// run();
