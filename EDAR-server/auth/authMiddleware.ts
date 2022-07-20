import { Request, Response, NextFunction } from 'express-serve-static-core';
import { IFrontierBearerToken } from '../models/IFrontierBearerToken';
import { refreshToken } from './OAuth';

export const CAPIauthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.useCapi) {
    console.info('Not using the capi...');
    if (req.session.bearerToken) {
      delete req.session.bearerToken;
    }
    // next();
    res.status(401).json({error: 'Not using the CAPI'});
    return;
  }

  if (!req.session.bearerToken) {
    resetCapi(req, res, next);
    return;
  }

  let token: IFrontierBearerToken = req.session.bearerToken;

  if (!token.access_token) {
    resetCapi(req, res, next);
    return;
  }

  if (!token.expires_at) {
    resetCapi(req, res, next);
    return;
  }

  const tokenAlmostExpired = token.expires_at - 3600 * 1000 < Date.now();
  if (tokenAlmostExpired) {
    const newToken = await refreshToken(token);
    if (newToken === undefined) {
      resetCapi(req, res, next);
      return;
    } else {
      token = newToken;
      req.session.bearerToken = token;
    }
  }

  next();
};

function resetCapi(req: Request, res:Response, next: NextFunction) {
  req.session.useCapi = false;
  CAPIauthMiddleware(req, res, next);
}
