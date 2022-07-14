import {Router} from 'express';
import bodyParser from 'body-parser';
import * as stateStore from '../stateStore/StateStore';

const router = Router();
export default router

router.use(bodyParser.json());

router.post('/register', async(req, res) => {
  const uuid = req.body.uuid;
  await stateStore.push(uuid);
  stateStore.numberOfUsers();
  res.send('OK');
});
