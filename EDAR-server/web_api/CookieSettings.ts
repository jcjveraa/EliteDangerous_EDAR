import { SessionOptions, CookieOptions } from 'express-session';
import {NODE_ENV_isDevelopment, NODE_ENV_isTest} from './NODE_ENV_isDevelopment';
import EDARSessionStore from '../stateStore/SessionStore';

import 'express-session';
declare module 'express-session' {
  interface SessionData {
    views?: number;
    bearerToken: string;
  }
}

const secureCookie = NODE_ENV_isDevelopment ? false : true;

const secureCookieOptions: CookieOptions =
{
  httpOnly: true,
  secure: secureCookie,
  signed: true,
  sameSite: true,
  maxAge: 14 * 24 * 3600 * 1000 // 14 days
};

if (!process.env.COOKIE_SECRET) {
  console.error('process.env.COOKIE_SECRET was not set, exiting');
  process.exit();
}
if (NODE_ENV_isDevelopment) {
  console.info('process.env.COOKIE_SECRET = ' + process.env.COOKIE_SECRET);
}

let store: EDARSessionStore | undefined = undefined;

if(!NODE_ENV_isTest) {
  store = new EDARSessionStore();
  const sessionMaintenance = (() => {
    store?.deleteOldSessions();
    if(NODE_ENV_isDevelopment) console.info('Clearing old sessions...');
  });

  const clearSessionDelay = 5*60*1000; // every 5 minutes;
  setInterval(sessionMaintenance, clearSessionDelay);
  setImmediate(sessionMaintenance);
}

export const sessionSettings: SessionOptions =
{
  secret: process.env.COOKIE_SECRET, // TODO implement rotation
  cookie: secureCookieOptions,
  proxy: true,
  resave: false,
  saveUninitialized: false,
  store: store
};
