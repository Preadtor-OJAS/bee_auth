import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// Session setup
app.use(session({
  secret: process.env.Session_Secret,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.Google_Client_ID,
  clientSecret: process.env.Google_Client_Secret,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// Home route
app.get("/", (req, res) => {
  res.send('<h1>Home</h1><a href="/auth/google">Login with Google</a>');
});

// Google Auth
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google Auth Callback
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));

// Profile route
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`
    <h1>Profile</h1>
    ${req.user ? <p>Welcome, ${req.user.displayName}!</p> : ''}
    <a href="/logout">Logout</a>
  `);
});

// Serialize & Deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Logout route
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Server start
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});