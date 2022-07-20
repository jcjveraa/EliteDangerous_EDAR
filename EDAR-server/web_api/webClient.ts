import { Router } from 'express';

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
