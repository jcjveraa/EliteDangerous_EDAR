import session from 'express-session';
import EDARSessionStore from './SessionStore';
import crypto from 'node:crypto';
import { server } from '..';

test('EdarSessionStore can set and get a session', () => {
  const store = new EDARSessionStore(); 
  const token = 'Im a token!';
  
  const callback = (err: unknown, sessionData: session.SessionData | null | undefined) => {
    expect(sessionData?.bearerToken).toBe(token);
  };
  
  const errorCallBack: ((err?: unknown) => void) | undefined = (err) => console.log(err);
  store.set('a', {bearerToken: token, cookie: {originalMaxAge: 14400}}, errorCallBack);
  store.set('a', {bearerToken: token, cookie: {originalMaxAge: 500}}, errorCallBack);
  store.get('a', callback);
  store.destroy('a', errorCallBack);
  
});

test('saltyness', () => {
  const toCheck = 'toCheck';
  const salt1 = crypto.randomBytes(64); 
  const salt2 = Buffer.from(salt1.toString('base64'), 'base64');

  const hash1 = crypto.scryptSync(toCheck, salt1,64).toString('base64');
  const hash2 = crypto.scryptSync(toCheck, salt2,64).toString('base64');

  expect(hash1).toBe(hash2);
});
 

test('Encrypter', () => {
  const test = 'test';
  const store = new EDARSessionStore();
  expect(store.encryptionTester(test, test).decrypted).toBe(test);  
  
});

afterAll((done) => {
  server.close();
  done();
});