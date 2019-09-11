/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sessions', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    user_agent: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    auth_type: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'sessions'
  });
};
