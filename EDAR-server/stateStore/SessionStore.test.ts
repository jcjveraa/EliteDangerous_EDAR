import session from 'express-session';
import EDARSessionStore from './SessionStore';
import { server } from '..';
import { IFrontierBearerToken } from '../models/IFrontierBearerToken';
import { stopMaintenance } from '../maintenance/Maintenance';

jest.useFakeTimers();
afterEach(() => stopMaintenance());

test('EdarSessionStore can set and get a session', async () => {
  const store = new EDARSessionStore();
  const token: IFrontierBearerToken = {
    access_token: 'I\'m a token!',
    token_type: '',
    expires_in: 0,
    refresh_token: ''
  };

  const callback = (err: unknown, sessionData: session.SessionData | null | undefined) => {
    if(err){
      errorCallBack(err);
    }
    expect(sessionData?.bearerToken.access_token).toBe(token.access_token);
  };

  const errorCallBack = ((err: unknown) => {
    if (err) {
      console.log(err);
    } else {
      store.get('a', callback);
    }
  });

  await store.set('a', { bearerToken: token, useCapi: true, cookie: { originalMaxAge: 14400 } }, errorCallBack);
  await store.set('a', { bearerToken: token, useCapi: true,cookie: { originalMaxAge: 500 } }, errorCallBack);

  // store.destroy('a', errorCallBack);

});

test('Encrypter', async () => {
  const test = 'test';
  const store = new EDARSessionStore();
  expect((await store.encryptionTester(test, test)).decrypted).toBe(test);

});

afterAll((done) => {
  server.close();
  done();
});
