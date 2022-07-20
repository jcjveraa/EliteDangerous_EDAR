import {ICAPIProfile} from '../models/ICAPIProfile';
import {IFrontierBearerToken} from '../models/IFrontierBearerToken';
import {httpRequestSender} from './httpRequestSender';

import {Router} from 'express';
import bodyParser from 'body-parser';

const router = Router();
export default router;

router.use(bodyParser.json());

router.get('/profile', async(req, res) => {
  if(!req.session.bearerToken) {
    res.status(500).json({err: 'no token'});
    return;
  }
  const token: IFrontierBearerToken = req.session.bearerToken;
  if(!token.access_token) {
    res.status(400).json({err: 'no access token'});
    return;
  }

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
