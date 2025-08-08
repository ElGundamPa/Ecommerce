const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Configuración JWT
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
};

// Estrategia JWT
passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user && user.isActive) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Estrategia Local
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findByEmail(email);
    
    if (!user) {
      return done(null, false, { message: 'Email o contraseña incorrectos' });
    }
    
    if (!user.isActive) {
      return done(null, false, { message: 'Cuenta desactivada' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return done(null, false, { message: 'Email o contraseña incorrectos' });
    }
    
    // Actualizar métricas de login
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Estrategia Google OAuth (solo si está configurada)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'tu_google_client_id') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Buscar usuario existente
      let user = await User.findBySocialId('google', profile.id);
      
      if (user) {
        return done(null, user);
      }
      
      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(profile.emails[0].value);
      if (existingUser) {
        // Vincular cuenta existente con Google
        existingUser.googleId = profile.id;
        await existingUser.save();
        return done(null, existingUser);
      }
      
      // Crear nuevo usuario
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        avatar: profile.photos[0]?.value,
        isEmailVerified: true
      });
      
      await user.save();
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

// Estrategia Facebook (solo si está configurada)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_ID !== 'tu_facebook_app_id') {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findBySocialId('facebook', profile.id);
      
      if (user) {
        return done(null, user);
      }
      
      const email = profile.emails?.[0]?.value;
      if (email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
          existingUser.facebookId = profile.id;
          await existingUser.save();
          return done(null, existingUser);
        }
      }
      
      user = new User({
        name: profile.displayName,
        email: email || `fb_${profile.id}@facebook.com`,
        facebookId: profile.id,
        avatar: profile.photos[0]?.value,
        isEmailVerified: !!email
      });
      
      await user.save();
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

// Estrategia Twitter (solo si está configurada)
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_KEY !== 'tu_twitter_consumer_key') {
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: "/api/auth/twitter/callback",
    includeEmail: true
  }, async (token, tokenSecret, profile, done) => {
    try {
      let user = await User.findBySocialId('twitter', profile.id);
      
      if (user) {
        return done(null, user);
      }
      
      const email = profile.emails?.[0]?.value;
      if (email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
          existingUser.twitterId = profile.id;
          await existingUser.save();
          return done(null, existingUser);
        }
      }
      
      user = new User({
        name: profile.displayName,
        email: email || `tw_${profile.id}@twitter.com`,
        twitterId: profile.id,
        avatar: profile.photos[0]?.value,
        isEmailVerified: !!email
      });
      
      await user.save();
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

// Serialización
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
