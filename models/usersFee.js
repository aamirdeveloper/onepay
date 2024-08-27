'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsersFee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UsersFee.init({
    userId: DataTypes.INTEGER,
    cryptoWithdrawFees: DataTypes.DOUBLE,
    cryptoDepositFees: DataTypes.DOUBLE,
    bankTransferWithdrawFees: DataTypes.DOUBLE,
    bankTransferDepositFees: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'UsersFee',
  });
  return UsersFee;
};