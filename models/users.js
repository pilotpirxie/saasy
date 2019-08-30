/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    auth_type: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    avatar_url: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    newsletter: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    marketing: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    activation_key: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    verified: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    blocked: {
      type: DataTypes.INTEGER(1),
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
    tableName: 'users'
  });
};
