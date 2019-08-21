const config = require('./config/config');
const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const sql = require('./config/sequelize.config');
const rateLimit = require('express-rate-limit');

// handlebars settings
const hbs = exphbs.create({
  helpers: {},
  extname: '.hbs',
  partialsDir: ['views/partials/', 'views/accounts/partials']
});

// settings
app.set('trust proxy', 1);
app.engine('hbs', hbs.engine);
app.set('port', process.env.PORT || config.DEFAULT_PORT);
app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(require('./lib/antiQueryPollution'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(rateLimit(require('./config/rateLimit.config')));
app.use(cookieSession({
  name: 'session',
  keys: [config.SESSION_SECRET],
  maxAge: 48 * 60 * 60 * 1000,
  secure: false
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
sql.testConnection();

// routing
app.use('/', require('./routes/home.js'));
app.use('/accounts', require('./routes/accounts.js'));

// error handling

// status code 404
app.use('*', require('./lib/status404'));

// catch server errors
app.use(require('./lib/status500'));


app.listen(app.get('port'), () => {
  try {
    console.info(`App is listening on http://localhost:${app.get('port')}`);
  } catch(err) {
    console.warn('App is listening but ip address information are unavailable');
    console.error(err);
  }
});
