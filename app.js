const createError = require('http-errors');
const express = require('express');
const useragent = require('express-useragent');
const session = require('express-session');
const uuid = require('uuid');
const path = require('path');
const favicon = require('serve-favicon');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const userSessionTrack = require('./middleware/userSessionTrack');

var indexRouter = require('./routes/index');
var roomRouter = require('./routes/room');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(compression());
app.use(morgan('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(useragent.express());
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));


app.use(userSessionTrack.sessionParser);

//default response headers
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,X-Requested-With,Authorization,token");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", 'world\'s luckiest developer');
  next();
});

app.use('/images',express.static(path.join(__dirname,'/public/images')));
app.use('/stylesheets',express.static(path.join(__dirname,'/public/stylesheets')));
app.use('/js',express.static(path.join(__dirname,'/public/javascripts')));
app.use('/fonts',express.static(path.join(__dirname,'/public/fonts')));
app.use(express.static(path.join(__dirname, 'public')));

// our user session tracking
app.all('*',userSessionTrack.findSessionUser);
app.use('/', indexRouter);
app.use('/room', roomRouter);
app.use('/users', usersRouter);

//endpoint for status checkers
app.get('/ping', function(req, res, next) {
  return res.status(200).send({time: new Date().getTime() }).end();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

/**
 * Returns a settings object for Express.js sessions.
 *
 * @param host
 *
 * @return {Object} `express-session` settings object
 */
function sessionSettings (host) {
  let sessionSettings = {
    secret: uuid.v1(),
    saveUninitialized: false,
    resave: false,
    rolling: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000
    }
  }
  // Cookies should set to be secure if https is on
  // if (secureCookies) {
  //   sessionSettings.cookie.secure = true
  // }

  // Determine the cookie domain
  sessionSettings.cookie.domain = host

  return sessionSettings
}