const sql = require('../config/sequelize.config');
const settingsModel = require('../models/settings')(sql.connection, sql.dataTypes);
const chalk = require("chalk");

sql.connection.authenticate().then(async () => {
  console.log(chalk.green("Connection has been established", "successfully"));
  const settings = await settingsModel.findAll();
  if (settings && settings.length > 0) {
    console.log(chalk.green("Select has been fullfilled successfully"));
  } else {
    console.error(chalk.green("Error occures while selecting settings successfully"));
  }
}).catch(err => {
  console.error("Unable to connect to the database:", err);
});