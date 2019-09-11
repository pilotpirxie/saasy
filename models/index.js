const sql = require('../config/sequelize.config');
const Users = require('../models/users')(sql.connection, sql.dataTypes);
const Sessions = require('../models/sessions')(sql.connection, sql.dataTypes);
const Groups = require('../models/groups')(sql.connection, sql.dataTypes);
const UserGroups = require('../models/user_groups')(sql.connection, sql.dataTypes);

module.exports = {
    Users,
    Sessions,
    Groups,
    UserGroups
};