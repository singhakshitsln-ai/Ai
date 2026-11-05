// FRANCIS Express server — Vercel compatible, PostgreSQL-backed.
'use strict';

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const session = require('express-session');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const app = express();
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Add a PostgreSQL connection string in Vercel Environment Variables.');
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && /sslmode=require/i.test(process.env.DATABASE_URL)
    ? { rejectUnauthorized: false } : undefined,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});
pool.on('error', err => console.error('PostgreSQL pool error:', err.message));

let schemaPromise;
function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(254) NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uq ON users (LOWER(email));
      CREATE TABLE IF NOT EXISTS oauth_accounts (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(20) NOT NULL,
        provider_user_id VARCHAR(200) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(provider, provider_user_id)
      );
      CREATE TABLE IF NOT EXISTS user_data (
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        data_key VARCHAR(80) NOT NULL,
        data_value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY(user_id, data_key)
      );
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR(200) PRIMARY KEY,
        sess TEXT NOT NULL,
        expire_at TIMESTAMPTZ NOT NULL
      );
      CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions(expire_at);
    `).catch(err => { schemaPromise = null; throw err; });
  }
  return schemaPromise;
}

// PostgreSQL-backed session store. Unlike local files, it persists between serverless invocations.
class PostgresSessionStore extends session.Store {
  get(sid, cb) {
    pool.query('SELECT sess FROM sessions WHERE sid=$1 AND expire_at > NOW()', [sid])
      .then(r => cb(null, r.rowCount ? JSON.parse(r.rows[0].sess) : null)).catch(cb);
  }
  set(sid, sess, cb) {
    const expires = sess.cookie && sess.cookie.expires ? new Date(sess.cookie.expires) : new Date(Date.now() + 7 * 86400000);
    pool.query(`INSERT INTO sessions(sid,sess,expire_at) VALUES($1,$2,$3)
      ON CONFLICT(sid) DO UPDATE SET sess=EXCLUDED.sess, expire_at=EXCLUDED.expire_at`,
      [sid, JSON.stringify(sess), expires]).then(() => cb && cb(null)).catch(err => cb && cb(err));
  }
  destroy(sid, cb) { pool.query('DELETE FROM sessions WHERE sid=$1',[sid]).then(()=>cb&&cb(null)).catch(err=>cb&&cb(err)); }
  touch(sid, sess, cb) {
    const expires = sess.cookie && sess.cookie.expires ? new Date(sess.cookie.expires) : new Date(Date.now()+7*86400000);
    pool.query('UPDATE sessions SET expire_at=$2 WHERE sid=$1',[sid,expires]).then(()=>cb&&cb(null)).catch(err=>cb&&cb(err));
  }
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use((req,res,next) => ensureSchema().then(()=>next()).catch(err=>{
  console.error('Database initialization failed:', err.message);
  res.status(503).json({error:'FRANCIS database is not configured or is temporarily unavailable.'});
}));
app.use(session({
  name: 'francis.sid',
  secret: process.env.SESSION_SECRET || 'development-only-change-this-secret',
  store: new PostgresSessionStore(),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { httpOnly:true, sameSite:'lax', secure:isProduction, maxAge:7*86400000 }
}));

const publicBaseUrl = (process.env.OAUTH_BASE_URL || (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : '')).replace(/\/$/,'');
passport.serializeUser((user,done)=>done(null,String(user.id)));
passport.deserializeUser((id,done)=>pool.query('SELECT id,name,email,created_at FROM users WHERE id=$1',[id])
  .then(r=>done(null,r.rows[0]||false)).catch(done));
app.use(passport.initialize());
app.use(passport.session());

async function upsertOAuthUser(provider, profile, email) {
  if (!email || !emailPattern.test(email)) throw new Error('A verified email address is required from this provider.');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const providerId = String(profile.id);
    let linked = await client.query('SELECT user_id FROM oauth_accounts WHERE provider=$1 AND provider_user_id=$2',[provider,providerId]);
    let user;
    if (linked.rowCount) {
      const result = await client.query('SELECT id,name,email,created_at FROM users WHERE id=$1',[linked.rows[0].user_id]);
      user = result.rows[0];
    } else {
      const normalizedEmail = email.toLowerCase();
      let result = await client.query('SELECT id,name,email,created_at FROM users WHERE LOWER(email)=LOWER($1) FOR UPDATE',[normalizedEmail]);
      user = result.rows[0];
      if (!user) {
        const name = String(profile.displayName || profile.username || normalizedEmail.split('@')[0]).trim().slice(0,60) || 'FRANCIS User';
        const placeholder = '!oauth:' + crypto.randomBytes(32).toString('hex');
        result = await client.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,created_at',[name,normalizedEmail,placeholder]);
        user = result.rows[0];
      }
      await client.query('INSERT INTO oauth_accounts(user_id,provider,provider_user_id) VALUES($1,$2,$3) ON CONFLICT(provider,provider_user_id) DO NOTHING',[user.id,provider,providerId]);
    }
    await client.query('COMMIT');
    return user;
  } catch(err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && publicBaseUrl) {
  passport.use('google',new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID, clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:publicBaseUrl+'/auth/google/callback'
  },async (accessToken,refreshToken,profile,done)=>{
    try {
      const entry=(profile.emails||[])[0];
      if (!entry || !(profile._json && profile._json.email_verified === true)) throw new Error('Google did not provide a verified email address.');
      done(null,await upsertOAuthUser('google',profile,entry.value));
    } catch(err) { done(err); }
  }));
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && publicBaseUrl) {
  passport.use('github',new GitHubStrategy({
    clientID:process.env.GITHUB_CLIENT_ID, clientSecret:process.env.GITHUB_CLIENT_SECRET,
    callbackURL:publicBaseUrl+'/auth/github/callback', scope:['user:email']
  },async (accessToken,refreshToken,profile,done)=>{
    try {
      const emails=profile.emails||[];
      const entry=emails.find(e=>e.verified&&e.primary)||emails.find(e=>e.verified);
      if (!entry) throw new Error('GitHub must provide a verified email. Check your email privacy settings.');
      done(null,await upsertOAuthUser('github',profile,entry.value));
    } catch(err) { done(err); }
  }));
}
function oauthCallback(provider) {
  return (req,res,next)=>passport.authenticate(provider,(err,user)=>{
    if(err||!user) { console.error('OAuth sign-in failed:',err&&err.message); return res.redirect('/?oauth=failed'); }
    req.logIn(user,loginErr=>{
      if(loginErr) { console.error(loginErr); return res.redirect('/?oauth=failed'); }
      req.session.userId=user.id;
      req.session.save(saveErr=>res.redirect(saveErr?'/?oauth=failed':'/?oauth=success'));
    });
  })(req,res,next);
}
app.get('/api/auth/providers',(req,res)=>res.json({
  google:!!(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&publicBaseUrl),
  github:!!(process.env.GITHUB_CLIENT_ID&&process.env.GITHUB_CLIENT_SECRET&&publicBaseUrl)
}));
app.get('/auth/google',(req,res,next)=>{
  if(!passport._strategy('google')) return res.status(503).send('Google sign-in is not configured yet.');
  passport.authenticate('google',{scope:['profile','email'],prompt:'select_account'})(req,res,next);
});
app.get('/auth/google/callback',oauthCallback('google'));
app.get('/auth/github',(req,res,next)=>{
  if(!passport._strategy('github')) return res.status(503).send('GitHub sign-in is not configured yet.');
  passport.authenticate('github')(req,res,next);
});
app.get('/auth/github/callback',oauthCallback('github'));

const authLimiter=rateLimit({windowMs:15*60*1000,limit:12,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Too many attempts. Please try again in 15 minutes.'}});
const publicUser=u=>({id:u.id,name:u.name,email:u.email,createdAt:u.created_at});
function requireAuth(req,res,next){if(!req.session.userId)return res.status(401).json({error:'Please sign in to use cloud account features.'});next();}

app.get('/api/health',async(req,res)=>{
  await pool.query('SELECT 1');
  res.json({ok:true,service:'FRANCIS',status:'online',database:'connected'});
});
app.get('/api/auth/me',async(req,res)=>{
  if(!req.session.userId)return res.json({authenticated:false,user:null});
  const result=await pool.query('SELECT id,name,email,created_at FROM users WHERE id=$1',[req.session.userId]);
  if(!result.rowCount){req.session.destroy(()=>{});return res.json({authenticated:false,user:null});}
  res.json({authenticated:true,user:publicUser(result.rows[0])});
});
app.post('/api/auth/signup',authLimiter,async(req,res)=>{
  const name=String(req.body.name||'').trim();
  const email=String(req.body.email||'').trim().toLowerCase();
  const password=String(req.body.password||'');
  if(name.length<2||name.length>60)return res.status(400).json({error:'Name must be 2–60 characters.'});
  if(!emailPattern.test(email)||email.length>254)return res.status(400).json({error:'Enter a valid email address.'});
  if(password.length<8||password.length>72)return res.status(400).json({error:'Password must be 8–72 characters.'});
  try {
    const hash=await bcrypt.hash(password,12);
    const result=await pool.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,created_at',[name,email,hash]);
    req.session.userId=result.rows[0].id;
    req.session.save(err=>{if(err)return res.status(500).json({error:'Could not create your session.'});res.status(201).json({user:publicUser(result.rows[0])});});
  } catch(err) {
    if(err.code==='23505')return res.status(409).json({error:'An account with this email already exists. Please sign in.'});
    console.error('Signup failed:',err.message);res.status(500).json({error:'Signup failed. Please try again.'});
  }
});
app.post('/api/auth/login',authLimiter,async(req,res)=>{
  const email=String(req.body.email||'').trim().toLowerCase();
  const password=String(req.body.password||'');
  const result=await pool.query('SELECT * FROM users WHERE LOWER(email)=LOWER($1)',[email]);
  const user=result.rows[0];
  if(!user||!String(user.password_hash).startsWith('$2')||!(await bcrypt.compare(password,user.password_hash)))return res.status(401).json({error:'Incorrect email or password.'});
  req.session.regenerate(err=>{
    if(err)return res.status(500).json({error:'Could not start your session.'});
    req.session.userId=user.id;
    req.session.save(saveErr=>{if(saveErr)return res.status(500).json({error:'Could not save your session.'});res.json({user:publicUser(user)});});
  });
});
app.post('/api/auth/logout',(req,res)=>req.session.destroy(err=>{
  res.clearCookie('francis.sid',{httpOnly:true,sameSite:'lax',secure:isProduction});
  if(err)return res.status(500).json({error:'Logout failed.'});res.json({ok:true});
}));
app.get('/api/account/data/:key',requireAuth,async(req,res)=>{
  const key=String(req.params.key||'');
  if(!/^[a-zA-Z0-9_.-]{1,80}$/.test(key))return res.status(400).json({error:'Invalid data key.'});
  const result=await pool.query('SELECT data_value,updated_at FROM user_data WHERE user_id=$1 AND data_key=$2',[req.session.userId,key]);
  if(!result.rowCount)return res.json({value:null});
  try{res.json({value:JSON.parse(result.rows[0].data_value),updatedAt:result.rows[0].updated_at});}catch{res.json({value:null});}
});
app.put('/api/account/data/:key',requireAuth,async(req,res)=>{
  const key=String(req.params.key||'');
  if(!/^[a-zA-Z0-9_.-]{1,80}$/.test(key))return res.status(400).json({error:'Invalid data key.'});
  const value=JSON.stringify(req.body&&req.body.value);
  if(value===undefined||Buffer.byteLength(value,'utf8')>500000)return res.status(413).json({error:'Data must be valid JSON under 500 KB.'});
  await pool.query(`INSERT INTO user_data(user_id,data_key,data_value,updated_at) VALUES($1,$2,$3,NOW())
    ON CONFLICT(user_id,data_key) DO UPDATE SET data_value=EXCLUDED.data_value,updated_at=NOW()`,[req.session.userId,key,value]);
  res.json({ok:true});
});
app.delete('/api/account/data/:key',requireAuth,async(req,res)=>{
  await pool.query('DELETE FROM user_data WHERE user_id=$1 AND data_key=$2',[req.session.userId,String(req.params.key)]);
  res.json({ok:true});
});

// Vercel serves /public assets from its CDN. This static middleware is also useful for local Node hosting.
app.use(express.static(PUBLIC_DIR,{extensions:['html'],maxAge:isProduction?'1h':0,etag:true}));
app.get('*',(req,res)=>res.sendFile(path.join(PUBLIC_DIR,'index.html')));
app.use((err,req,res,next)=>{console.error('FRANCIS request error:',err);if(res.headersSent)return next(err);res.status(500).json({error:'Internal server error.'});});

// Vercel detects the exported Express app. This also allows `npm start` locally.
if (require.main === module) {
  const port=Number(process.env.PORT||3000);
  app.listen(port,()=>console.log(`FRANCIS server listening on ${port}`));
}
module.exports=app;
