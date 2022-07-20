import {ICAPIProfile} from '../models/ICAPIProfile';
import {IFrontierBearerToken} from '../models/IFrontierBearerToken';
import {httpRequestSender} from './httpRequestSender';
import { CAPIauthMiddleware } from '../auth/authMiddleware';

import {Router} from 'express';

const router = Router();
export default router;

router.use(CAPIauthMiddleware);

router.get('/profile', async(req, res) => {
  if(!req.session.useCapi) {
    res.status(500).json({err: 'CAPI not in use for this session.'});
    return;
  }
  if(!req.session.bearerToken) {
    res.status(500).json({err: 'no token'});
    return;
  }
  const token: IFrontierBearerToken = req.session.bearerToken;

  const profile = await getProfile(token);

  const result = {
    name: profile.commander.name,
    credits: profile.commander.credits,
    docked: profile.commander.docked,
    system_name: profile.lastSystem.name,
    station_name: profile.lastStarport.name,
  };

  res.json(result);
});


function getProfile(token: IFrontierBearerToken): Promise<ICAPIProfile>{
  const headers = {
    'Accept-Encoding': 'gzip, *',
    'Authorization': `Bearer ${token.access_token}`
  };

  const options = {
    host: 'companion.orerve.net',
    method: 'GET',
    headers: headers,
    path: '/profile'
  };

  return httpRequestSender<ICAPIProfile>(options);
}
