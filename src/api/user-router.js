// Load express and Router
import express from 'express';
const router = express.Router();

import User from './user-model.js';
import auth from '../middleware/auth.js';

// These routes should support a redirect instead of just spitting out the token ...
router.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then((user) => {
      req.token = user.generateToken();
      req.user = user;
      res.send(req.token);
    }).catch(error => {
      const err = { status: 400, statusMessage: 'Bad Request' };
      next(err);
    });
});

router.post('/signin', auth(), (req, res) => {
  res.send(req.token);
});

export default router;