'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CryptoAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CryptoAccount.init({
    currency: DataTypes.STRING,
    walletAddress: DataTypes.STRING,
    network: DataTypes.STRING,
    QRImage: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'CryptoAccount',
  });
  return CryptoAccount;
};