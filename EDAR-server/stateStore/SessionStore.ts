import session from 'express-session';
import { db } from '..';
import crypto from 'node:crypto';
import { NODE_ENV_isDevelopment } from '../web_api/NODE_ENV_isDevelopment';

export default class EDARSessionStore extends session.Store {
  private table = 'sessions';
  private algorithm = 'aes-256-cbc';
  private insertStatement = db.prepare(`INSERT INTO ${this.table} (sid_hash, token_encrypted, expires) VALUES (?, ?, ?);`);
  private touchStatement = db.prepare(`UPDATE ${this.table} SET expires=? WHERE sid_hash=?;`);
  private updateStatement = db.prepare(`UPDATE ${this.table} SET token_encrypted=?, expires=? WHERE sid_hash=?;`);
  private getStatement = db.prepare(`SELECT sid_hash, token_encrypted, expires FROM ${this.table} WHERE sid_hash=?;`);
  private deleteStatement = db.prepare(`DELETE FROM ${this.table} WHERE sid_hash=?;`);
  private deleteExpiredStatement = db.prepare(`DELETE FROM ${this.table} WHERE expires<?;`);

  async get(sid: string, callback: (err: unknown, session?: session.SessionData | null | undefined) => void): Promise<void> {
    let err = null;
    let returnedSession: session.SessionData | null = null;
    try {
      const sid_hash = this.sid_hasher(sid);
      const getResult: { sid_hash: string, token_encrypted: string, expires: number } = this.getStatement.get(sid_hash);
      if (getResult !== undefined) {
        const decrypted = await this.decrypt(getResult.token_encrypted, sid);
        returnedSession = JSON.parse(decrypted);
        if (returnedSession?.cookie) {
          returnedSession.cookie.expires = new Date(getResult.expires);
        }
      }

    } catch (error) {
      err = error;
    } finally {
      if (callback) {
        callback(err, returnedSession);
      }
    }
  }

  async set(sid: string, session: session.SessionData, callback?: ((err?: unknown) => void) | undefined): Promise<void> {
    let err = null;
    try {
      const sid_hash = this.sid_hasher(sid);
      const token_encrypted = await this.encrypt(JSON.stringify(session), sid);
      const encrypted_session = this.getStatement.get(sid_hash);
      if (encrypted_session === undefined) {
        if (NODE_ENV_isDevelopment) console.log(session.cookie);
        this.insertStatement.run(sid_hash, token_encrypted, session.cookie.expires?.getTime());
      } else {
        this.updateStatement.run(token_encrypted, session.cookie.expires?.getTime(), sid_hash);
      }
    } catch (error) {
      err = error;
    } finally {
      if (callback) {
        callback(err);
      }

    }
  }

  async touch(sid: string, session: session.SessionData, callback?: (() => void) | undefined): Promise<void> {
    let err = null;
    try {
      const sid_hash = this.sid_hasher(sid);
      this.touchStatement.run(session.cookie.expires?.getTime(), sid_hash);

    } catch (error) {
      err = error;
      console.error('Some error in Touch...', err);
    } finally {
      if (callback) {
        callback();
      }

    }
  }

  async destroy(sid: string, callback?: ((err?: unknown) => void) | undefined): Promise<void> {
    const sid_hash = this.sid_hasher(sid);
    let err = null;
    try {
      this.deleteStatement.run(sid_hash);
    } catch (error) {
      err = error;
    } finally {
      if (callback) {
        callback(err);
      }
    }
  }

  public async deleteOldSessions() {
    if(NODE_ENV_isDevelopment) console.log('Deleting old sessions...');
    try {
      this.deleteExpiredStatement.run(Date.now());
    } catch (error) {
      console.error('Some error occurred when trying to delete old sessions');
      console.error(error);
    }
  }

  private sid_hasher(toBeHashed: string) {
    return crypto.createHash('sha256').update(toBeHashed).digest('base64');
  }

  private async encrypt(toEncrypt: string, password: string) {
    const salt = await this.randomBytesAsync();

    const key = await this.asyncScrypt(password, salt, 32);
    const iv = await this.randomBytesAsync();

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(toEncrypt, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const result = encrypted + '.' + salt.toString('base64') + '.' + Buffer.from(iv).toString('base64');

    return result;
  }

  private async decrypt(toDencrypt: string, password: string) {
    const splitString = toDencrypt.split('.');
    if (splitString.length !== 3) {
      throw new Error('Incorrect format of encrypted string');

    }
    const cipherText = splitString[0];
    const salt = Buffer.from(splitString[1], 'base64');
    const iv = Buffer.from(splitString[2], 'base64');
    const key = await this.asyncScrypt(password, salt, 32);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

    let decrypted = decipher.update(cipherText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  public async encryptionTester(testString: string, password: string) {
    const encrypted = await this.encrypt(testString, password);
    const decrypted = await this.decrypt(encrypted, password);
    return { ciphertext: encrypted, decrypted: decrypted };
  }

  private async asyncScrypt(password: crypto.BinaryLike, salt: Buffer, keyLen: number) {
    return new Promise<Buffer>((resolve, reject) =>
      crypto.scrypt(password, salt, keyLen, (err, buf) => this.asyncResolver(err, resolve, buf, reject)));
  }

  private async randomBytesAsync(numBytes = 16): Promise<Buffer> {
    return new Promise((resolve, reject) =>
      crypto.randomBytes(numBytes, (err, bytes) => this.asyncResolver(err, resolve, bytes, reject)));
  }

  private asyncResolver(err: Error | null, resolve: (value: Buffer | PromiseLike<Buffer>) => void, buf: Buffer,
    reject: { (reason?: unknown): void; (reason?: unknown): void; (arg0: Error): void; }) {
    if (err === null) {
      resolve(buf);
    } else {
      console.error(err.name, err.message);
      reject(err);
    }
  }
}
