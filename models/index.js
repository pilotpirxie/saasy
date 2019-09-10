const sql = require('../config/sequelize.config');
const Users = require('../models/users')(sql.connection, sql.dataTypes);
const Prompts = require('../models/prompts')(sql.connection, sql.dataTypes);
const Groups = require('../models/groups')(sql.connection, sql.dataTypes);
const UserGroups = require('../models/user_groups')(sql.connection, sql.dataTypes);

module.exports = {
    Users,
    Prompts,
    Groups,
    UserGroups
};