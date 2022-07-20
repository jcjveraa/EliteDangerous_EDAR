import { SessionOptions, CookieOptions } from 'express-session';
import {NODE_ENV_isDevelopment, NODE_ENV_isTest} from '../web_api/NODE_ENV_isDevelopment';
import EDARSessionStore from './SessionStore';

import 'express-session';
import { addMaintainer } from '../maintenance/Maintenance';
import { IFrontierBearerToken } from '../models/IFrontierBearerToken';
declare module 'express-session' {
  interface SessionData {
    views?: number;
    bearerToken: IFrontierBearerToken;
  }
}

const secureCookie = NODE_ENV_isDevelopment ? false : true;

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
  addMaintainer(store?.deleteOldSessions);
}

const secureCookieOptions: CookieOptions =
{
  httpOnly: true,
  secure: secureCookie,
  signed: true,
  sameSite: true,
  maxAge: 14 * 24 * 3600 * 1000,
};

export const sessionSettings: SessionOptions =
{
  secret: process.env.COOKIE_SECRET, // TODO implement rotation
  cookie: secureCookieOptions,
  proxy: true,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: store
};
