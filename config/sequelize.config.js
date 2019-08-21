const Sequelize = require('sequelize');
const config = require('./config');
const date = new Date();

/**
 * Create new sequelize connection
 * @type {Sequelize}
 */
const sql = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASS,
  {
    dialect: 'mysql',
    host: config.DB_HOST,
    port: config.DB_PORT,
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
 */
function testConnection(connection = sql) {
  connection.authenticate().then(() => {
    console.info('Connection has been established successfully');
  }).catch(err => {
    console.error(err);
  });
}

module.exports = {
  connection: sql,
  dataTypes: Sequelize.DataTypes,
  testConnection: testConnection,
};
