const Sequelize = require('sequelize');
const config = require('./config');
const date = new Date();

/**
 * Create new sequelize connection
 * @type {Sequelize}
 */
const sql = new Sequelize(
  config.DB.NAME,
  config.DB.USER,
  config.DB.PASS,
  {
    dialect: 'mysql',
    host: config.DB.HOST,
    port: config.DB.PORT,
    define: {
      underscored: true,
      charset: 'utf8',
      dialectOptions: {
        collate: 'utf8_unicode_ci'
      },
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    logging: process.env.NODE_ENV === 'production' ? false : (msg, data) => {
      const dateTime = date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' ' + date.toLocaleTimeString('pl-PL', { hour12: false });
      console.log(dateTime, 'SQL Query:', msg);
      console.log(dateTime, 'SQL Data:', JSON.stringify(data));
    }
  }
);

/**
 * Try to connect to a database
 * To work correctly you must specify host in user database settings
 * e.g. in Panel -> MySQL -> Users -> <user> -> Manage hosts -> Add access from new address
 * and attach new permissions to the database
 * e.g. Panel -> MySQL -> <database> -> Manage -> Grant permissions -> <pick user> -> pick "All hosts belonging to user"
 * @param {sequelize} connection
 * @param {function} callback
 */
function testConnection(connection = sql, callback = () => {}) {
  connection.authenticate().then(() => {
    console.info('Connection has been established successfully');
    callback();
  }).catch(err => {
    console.error(err);
  });
}

/**
 * Synchronize schemas in database
 * @param {sequelize} connection
 * @param {boolean} force? Should overwrite information
 * @param {boolean} showLogs?
 */
function synchronizeSchema(connection = sql, force = false, showLogs = false) {
    connection.sync({logging: showLogs && console.log, force}).then(() => {
        console.info('Schema has been synchronized successfully');
    }).catch(err => {
        console.error(err);
    });
}

module.exports = {
  connection: sql,
  dataTypes: Sequelize.DataTypes,
  testConnection,
  synchronizeSchema
};
