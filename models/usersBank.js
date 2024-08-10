'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsersBank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UsersBank.init({
    userId: DataTypes.INTEGER,
    bankAccountId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'UsersBank',
  });
  return UsersBank;
};