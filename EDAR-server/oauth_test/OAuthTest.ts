import {Router} from 'express';

const router = Router();
export default router;

router.post('/auth', (req, res) => {
  console.log('AUTH type was POST');
  console.log(req);

});


router.get('/auth', (req, res) => {
  console.log('AUTH type was GET');
  // console.log(req);
  const q = req.query;
  const redirectUri = q.redirect_uri as string;
  const state = q.state as string;
  res.redirect(redirectUri + '?code=abcdefgs&state=' + state)
});


router.post('/token', (req, res) => {
  console.log('TOKEN type was POST');
  // console.log(req);
  res.send(req.body);
});


router.get('/token', (req, res) => {
  console.log('TOKEN type was GET');
  // console.log(req);
  res.send(req.body)
});
