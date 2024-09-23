'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsersPromptPay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UsersPromptPay.init({
    userId: DataTypes.INTEGER,
    promptPayId: DataTypes.INTEGER,
    fees: DataTypes.DOUBLE,
  }, {
    sequelize,
    modelName: 'UsersPromptPay',
  });
  return UsersPromptPay;
};