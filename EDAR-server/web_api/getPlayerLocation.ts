import {ICAPIProfile} from '../models/ICAPIProfile';
import {IFrontierBearerToken} from '../models/IFrontierBearerToken';
import {httpRequestSender} from './httpRequestSender';

import {Router} from 'express';
import bodyParser from 'body-parser';

const router = Router();
export default router;

router.use(bodyParser.json());

router.post('/profile', async(req, res) => {
  const token: IFrontierBearerToken = req.body;
  if(!token.access_token) {
    res.sendStatus(400);
    return;
  }

  const profile = await getProfile(token);

  const result = {
    name: profile.commander.name,
    credits: profile.commander.credits,
    docked: profile.commander.docked,
    system: profile.lastSystem,
    station: profile.lastStarport
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
