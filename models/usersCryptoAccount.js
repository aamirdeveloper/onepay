'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class usersCryptoAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  usersCryptoAccount.init({
    userId: DataTypes.INTEGER,
    cryptoAccountId: DataTypes.INTEGER,
    fees: DataTypes.DOUBLE,
  }, {
    sequelize,
    modelName: 'usersCryptoAccount',
  });
  return usersCryptoAccount;
};