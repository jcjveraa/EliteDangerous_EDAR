import session from 'express-session';
import { db } from '..';
import crypto from 'node:crypto';

export default class EDARSessionStore extends session.Store {
  private table = 'sessions';
  private algorithm = 'aes-256-cbc';
  private insertStatement = db.prepare(`INSERT INTO ${this.table} (sid_hash, token_encrypted, last_seen) VALUES (?, ?, ?);`);
  private updateStatement = db.prepare(`UPDATE ${this.table} SET token_encrypted=?, last_seen=? WHERE sid_hash=?;`);
  private getStatement = db.prepare(`SELECT sid_hash, token_encrypted FROM ${this.table} WHERE sid_hash=?;`);
  private deleteStatement = db.prepare(`DELETE FROM ${this.table} WHERE sid_hash=?;`);
  private deleteBeforeStatement = db.prepare(`DELETE FROM ${this.table} WHERE last_seen<?;`);

  private deleteSessionAfterDays = 14;

  async get(sid: string, callback: (err: unknown, session?: session.SessionData | null | undefined) => void): Promise<void> {
    let err = null;
    let session = null;
    try {
      const sid_hash = this.sid_hasher(sid);
      const encrypted_session: {sid_hash: string, token_encrypted: string} = this.getStatement.get(sid_hash);
      if (encrypted_session !== undefined) {
        const decrypted = await this.decrypt(encrypted_session.token_encrypted, sid);
        session = JSON.parse(decrypted);
      }

    } catch (error) {
      err = error;
    }
    finally {
      if (callback) {
        callback(err, session);
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
        this.insertStatement.run(sid_hash, token_encrypted, Date.now());
      }
      else {
        this.updateStatement.run(token_encrypted, Date.now(), sid_hash);
      }
    } catch (error) {
      err = error;
    }
    finally {
      if (callback) {
        callback(err);
      }

    }
  }

  async destroy(sid: string, callback?: ((err?: unknown) => void) | undefined): Promise<void> {
    const sid_hash = this.sid_hasher(sid);
    let err = null;
    try {
      this.deleteStatement.run(sid_hash);
    }
    catch (error) {
      err = error;
    }
    finally {
      if (callback) {
        callback(err);
      }
    }
  }

  public async deleteOldSessions() {
    try { 
      const deleteAfterMilisecons = this.deleteSessionAfterDays * 24 * 3600 * 1000;
      const deleteBefore = Date.now() - deleteAfterMilisecons;
      this.deleteBeforeStatement.run(deleteBefore);
    
    } catch (error) {
      console.error('Some error occurred when trying to delete old sessions');
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
    }
    else {
      console.error(err.name, err.message);
      reject(err);
    }
  }
}
