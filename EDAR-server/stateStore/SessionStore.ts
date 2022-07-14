import session from 'express-session';
import { db } from '..';
import crypto from 'node:crypto';

export default class EDARSessionStore extends session.Store {

  private table = 'sessions';
  private algorithm = 'aes-256-cbc';
  private insertStatement = db.prepare(`INSERT INTO ${this.table} (sid_hash, token_encrypted) VALUES (?, ?);`);
  private updateStatement = db.prepare(`UPDATE ${this.table} SET token_encrypted=? WHERE sid_hash=?;`);
  private getStatement = db.prepare(`SELECT sid_hash, token_encrypted FROM ${this.table} WHERE sid_hash=?;`);
  private deleteStatement = db.prepare(`DELETE FROM ${this.table} WHERE sid_hash=?;`);

  get(sid: string, callback: (err: unknown, session?: session.SessionData | null | undefined) => void): void {
    let err = null;
    let session = null;
    try {
      const sid_hash = this.sid_hasher(sid);
      const encrypted_session = this.getStatement.get(sid_hash);    
      if(encrypted_session !== undefined) {
        session = JSON.parse(this.decrypt(encrypted_session.token_encrypted, sid));
      }     

    }  catch (error) {
      err = error;
    }
    finally {
      if (callback) {
        callback(err, session);
      }
    }
  }

  set(sid: string, session: session.SessionData, callback?: ((err?: unknown) => void) | undefined): void {
    let err = null;
    try {
      const sid_hash = this.sid_hasher(sid);
      const token_encrypted = this.encrypt(JSON.stringify(session), sid);

      const encrypted_session = this.getStatement.get(sid_hash);    
      if(encrypted_session === undefined) {
        this.insertStatement.run(sid_hash, token_encrypted);
        
      }
      else {
        this.updateStatement.run(token_encrypted, sid_hash);
      }

    }  catch (error) {
      err = error;
    }
    finally {
      if (callback) {
        callback(err);
      }
    }
  }
  
  destroy(sid: string, callback?: ((err?: unknown) => void) | undefined): void {
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

  private sid_hasher(toBeHashed: string) {
    return crypto.createHash('sha256').update(toBeHashed).digest('base64');
  }

  private encrypt(toEncrypt: string, password: string) {
    const salt = this.newSalt();
    const key = crypto.scryptSync(password, salt, 32);
    const iv = crypto.randomFillSync(new Uint8Array(16));

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(toEncrypt, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const result = encrypted + '.' + salt.toString('base64') + '.' + Buffer.from(iv).toString('base64');

    return result;
  }

  private newSalt() {
    return crypto.randomBytes(16);
  }

  private decrypt(toDencrypt: string, password: string) {
    const splitString = toDencrypt.split('.');
    if (splitString.length !== 3) {
      throw new Error('Incorrect format of encrypted string');

    }
    const cipherText = splitString[0];
    const salt = Buffer.from(splitString[1], 'base64');
    const iv = Buffer.from(splitString[2], 'base64');
    const key = crypto.scryptSync(password, salt, 32);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

    let decrypted = decipher.update(cipherText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  public encryptionTester(testString: string, password: string) {
    const encrypted = this.encrypt(testString, password);
    const decrypted = this.decrypt(encrypted, password);
    return { ciphertext: encrypted, decrypted: decrypted };
  }
}
