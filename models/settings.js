/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('settings', {
    name: {
      type: DataTypes.STRING(256),
      allowNull: false,
      primaryKey: true
    },
    content: {
      type: DataTypes.STRING(256),
      allowNull: false
    }
  }, {
    tableName: 'settings'
  });
};
