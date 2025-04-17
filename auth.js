const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const router = express.Router();

router.get('/signup', (req, res) => res.render('signup'));
router.post('/signup', async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  await User.create({ username: req.body.username, password: hashed });
  res.redirect('/login');
});

router.get('/login', (req, res) => res.render('login'));
router.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  const match = user && await bcrypt.compare(req.body.password, user.password);
  if (match) {
    req.session.user = user;
    res.redirect('/chat');
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
