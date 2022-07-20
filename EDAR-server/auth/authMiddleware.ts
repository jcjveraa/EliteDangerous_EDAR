import { Request, ParamsDictionary, NextFunction } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { IFrontierBearerToken } from '../models/IFrontierBearerToken';
import { refreshToken } from './OAuth';

export const authMiddleware = async (req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, _res: unknown, next: NextFunction) => {
  if (!req.session.useCapi) {
    console.info('Not using the capi...');
    if (req.session.bearerToken) {
      delete req.session.bearerToken;
    }
    next();
    return;
  }

  if (!req.session.bearerToken) {
    resetCapi(req, next);
    return;
  }

  let token: IFrontierBearerToken = req.session.bearerToken;

  if (!token.access_token) {
    resetCapi(req, next);
    return;
  }

  if (!token.expires_at) {
    resetCapi(req, next);
    return;
  }

  const tokenAlmostExpired = token.expires_at - 3600 * 1000 < Date.now();
  if (tokenAlmostExpired) {
    const newToken = await refreshToken(token);
    if (newToken === undefined) {
      resetCapi(req, next);
      return;
    } else {
      token = newToken;
      req.session.bearerToken = token;
    }
  }

  next();
};

function resetCapi(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, next: NextFunction) {
  req.session.useCapi = false;
  next();
}

