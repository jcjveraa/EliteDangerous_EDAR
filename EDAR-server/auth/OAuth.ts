import { Router } from 'express';
import { CallbackParamsType, generators, IssuerMetadata } from 'openid-client';
import { Issuer } from 'openid-client';
import https from 'https';
import http from 'http';
import zlib from 'node:zlib';
import { IFrontierBearerToken } from '../models/IFrontierBearerToken';
import { httpRequestSender } from '../web_api/httpRequestSender';
import * as stateStore from '../stateStore/StateStore';
import {NODE_ENV_isDevelopment} from '../web_api/NODE_ENV_isDevelopment';


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

// http://localhost:3001/api/FrontierApi/requestTokenV2/43838ec2-3df8-42e9-881c-f32c07959193

router.get('/requestTokenV2/:state', async (req, res) => {
  // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
  // it should be httpOnly (not readable by javascript) and encrypted.

  const code_challenge = generators.codeChallenge(code_verifier);

  const regex_UUIDV4 = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

  const state = req.params.state;
  if (!state.match(regex_UUIDV4)) {
    res.sendStatus(400);
    return;
  }

  await stateStore.push(state);

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

router.get('/removeCapi', ((req,res) => {
  req.session.useCapi = false;
  req.session.bearerToken = undefined;
  res.send('CAPI removed');
}));

router.get('/codeCallbackV2', async (req, res) => {
  const state = req.query.state as string;
  if (!stateStore.includes(state)) {
    console.error('State not recognized');
    res.sendStatus(500);
    return;
  }

  const params = client.callbackParams(req);
  let token: IFrontierBearerToken = await getToken(code_verifier, params);
  if (NODE_ENV_isDevelopment) {
    console.log(token);
  }

  token = setExpiresAt(token);
  
  // const authInfo = await decodeToken(token);
  req.session.bearerToken = token;
  req.session.useCapi = true;

  stateStore.deleteState(state);

  if(!process.env.BASE_UI_URL) {
    throw new Error('UI base url not set');
  }
  res.redirect(process.env.BASE_UI_URL);
});

function setExpiresAt(token: IFrontierBearerToken) {
  token.expires_at = token.expires_in * 1000 + Date.now();
  return token;
}

export async function refreshToken(current_token: IFrontierBearerToken){
  const data = {
    client_id: <string>process.env.FRONTIER_CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: current_token.refresh_token
  };

  if(NODE_ENV_isDevelopment) console.log('trying to refresh the token...');

  let token = await sendTokenRequest(data);
  if(token && token.access_token) {
    token = setExpiresAt(token);
    if(NODE_ENV_isDevelopment) console.log('Token refresh success');  
    return token;
  } else {
    if(NODE_ENV_isDevelopment) console.log('Token refresh FAIL');
    return undefined;
  }
}

async function getToken(code_verifier: string, params: CallbackParamsType): Promise<IFrontierBearerToken> {

  const data = {
    client_id: <string>process.env.FRONTIER_CLIENT_ID,
    code_verifier: code_verifier,
    state: params.state,
    code: params.code,
    redirect_uri: CALLBACK_URI_V2,
    grant_type: 'authorization_code'
  };

  return sendTokenRequest(data);
}

function sendTokenRequest(data: object) {
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

function formatAsFormString(data: object): string {
  const urlEncoder = new URLSearchParams;

  Object.entries(data).forEach(
    ([key, value]) => urlEncoder.append(key, (value as string))
  );

  const formData = urlEncoder.toString();
  return formData;
}
