'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WithdrawRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  WithdrawRequest.init({
    userId: DataTypes.INTEGER,
    withdrawType: DataTypes.STRING,
    withdrawMethod: DataTypes.STRING,
    amount: DataTypes.DOUBLE,
    bankName: DataTypes.STRING,
    bankAccountNumber: DataTypes.STRING,
    bankAccountName: DataTypes.STRING,
    currency: DataTypes.STRING,
    timePeriod: DataTypes.STRING,
    network: DataTypes.STRING,
    walletAddress: DataTypes.STRING,
    withdrawStatus:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'WithdrawRequest',
  });
  return WithdrawRequest;
};
