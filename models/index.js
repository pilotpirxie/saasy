const sql = require('../config/sequelize.config');
const Users = require('./users')(sql.connection, sql.dataTypes);
const Sessions = require('./sessions')(sql.connection, sql.dataTypes);
const Groups = require('./groups')(sql.connection, sql.dataTypes);
const UserGroups = require('./user_groups')(sql.connection, sql.dataTypes);

module.exports = {
  Users,
  Sessions,
  Groups,
  UserGroups,
};
