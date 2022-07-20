import { Router } from 'express';
import {CAPIauthMiddleware} from '../auth/authMiddleware';

const router = Router();
export default router;

router.get('/register', (req, res) => {
  // console.log(req.session);
  if (req.session.views) {
    req.session.views = req.session.views+1;
    res.json(req.session);
    
  } else {
    req.session.views = 1;
    res.send('welcome to the session demo. refresh!');
  }
});


router.get('/', (req, res) => {
  console.log(req.session.bearerToken);
  res.json(req.session);
});


router.get('/checkIfAuthenticated', (req, res) => {
  CAPIauthMiddleware(req, res, () => res.send('Yes'));
});
