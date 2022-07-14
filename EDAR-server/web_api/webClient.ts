import { Router } from 'express';

const router = Router();
export default router;

router.get('/register', (req, res) => {
  console.log(req.session);
  if (req.session.views) {
    req.session.views++;
    res.setHeader('Content-Type', 'text/html');
    res.write('<p>views: ' + req.session.views + '</p>');
    if (req.session.cookie.maxAge) { res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>'); }
    res.end();
  } else {
    req.session.views = 1;
    res.end('welcome to the session demo. refresh!');
  }

  // res.send('OK');
});
