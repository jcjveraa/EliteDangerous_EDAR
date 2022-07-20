import { Router } from 'express';
import { CallbackParamsType, generators, IssuerMetadata } from 'openid-client';
import { Issuer } from 'openid-client';
import https from 'https';
import http from 'http';
import zlib from 'node:zlib';
import { IFrontierBearerToken } from '../models/IFrontierBearerToken';
import { httpRequestSender } from './httpRequestSender';
import * as stateStore from '../stateStore/StateStore';
import {NODE_ENV_isDevelopment} from './NODE_ENV_isDevelopment';


const router = Router();
export default router;

// const stateStore: string[] = [];

const FRONTIER_API = '/FrontierApi';
const CALLBACK_URI_V2 = process.env.BASE_API_URL + FRONTIER_API + '/codeCallbackV2';
const FRONTIER_BASE_URL = 'https://auth.frontierstore.net';
// const FRONTIER_BASE_URL = 'http://localhost:3001';

const CONFIGV2: IssuerMetadata = {
  issuer: 'EDAR',
  authorization_endpoint: FRONTIER_BASE_URL + '/auth',
  token_endpoint: FRONTIER_BASE_URL + '/token',
};

export const useHttps = CONFIGV2.token_endpoint?.startsWith('https');
export const httpModuleToUse = useHttps ? https : http;


const testOptions: http.RequestOptions = {
  host: 'localhost',
  port: process.env.API_PORT,
};

const liveOptions: https.RequestOptions = {
  host: 'auth.frontierstore.net',
};

const issuer = new Issuer(CONFIGV2);
const { Client } = issuer;
const code_verifier = generators.codeVerifier();

const client = new Client({
  client_id: <string>process.env.FRONTIER_CLIENT_ID,
  // client_secret: <string>process.env.FRONTIER_SHARED_KEY,
  redirect_uris: [CALLBACK_URI_V2],
  token_endpoint_auth_method: 'none',
  response_types: ['code']
});

router.get('/requestTokenV2/:state', (req, res) => {
  // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
  // it should be httpOnly (not readable by javascript) and encrypted.

  const code_challenge = generators.codeChallenge(code_verifier);

  const regex_UUIDV4 = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

  const state = req.params.state;
  if (!state.match(regex_UUIDV4)) {
    res.sendStatus(400);
    return;
  }

  // stateStore.push(state);

  const SCOPE = 'capi';

  const authUrl = client.authorizationUrl({
    scope: SCOPE,
    code_challenge,
    code_challenge_method: 'S256',
    state: state
  });

  console.log('Auth url:', authUrl);
  // res.send('yo')
  res.redirect(authUrl);
});

router.get('/codeCallbackV2', async (req, res) => {
  if (!stateStore.includes(req.query.state as string)) {
    console.error('State not recognized');
    res.sendStatus(500);
    return;
  }

  const params = client.callbackParams(req);
  const token: IFrontierBearerToken = await getToken(code_verifier, params);
  if (NODE_ENV_isDevelopment) {
    console.log(token);
  }
  // const authInfo = await decodeToken(token);
  req.session.bearerToken = token;
  res.json(token);
});

async function getToken(code_verifier: string, params: CallbackParamsType): Promise<IFrontierBearerToken> {

  const data = {
    client_id: <string>process.env.FRONTIER_CLIENT_ID,
    code_verifier: code_verifier,
    state: params.state,
    code: params.code,
    redirect_uri: CALLBACK_URI_V2,
    grant_type: 'authorization_code'
  };

  const formDataString = formatAsFormString(data);

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept-Encoding': 'gzip',
    'Content-Length': formDataString.length
  };

  const options: https.RequestOptions = {
    host: liveOptions.host,
    method: 'POST',
    headers: headers,
    path: '/token'
  };

  return httpRequestSender<IFrontierBearerToken>(options, formDataString, useHttps);
}

export function extractDataFromMessage(res: http.IncomingMessage, dataBuffer: Buffer) {
  if (res.headers['content-encoding'] === 'gzip') {
    return zlib.gunzipSync(dataBuffer).toString();
  } else {
    return dataBuffer.toString();
  }
}

export function modifyOptionsForTesting(options: https.RequestOptions) {
  options.port = testOptions.port;
  options.host = testOptions.host;
}

function formatAsFormString(data: { client_id: string; code_verifier: string; state: string | undefined; code: string | undefined; redirect_uri: string; grant_type: string; }): string {
  const urlEncoder = new URLSearchParams;

  Object.entries(data).forEach(
    ([key, value]) => urlEncoder.append(key, (value as string))
  );

  const formData = urlEncoder.toString();
  return formData;
}
