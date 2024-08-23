'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class P2PExchange extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  P2PExchange.init({
    advertiser: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    currencyFrom: DataTypes.STRING,
    currencyTo: DataTypes.STRING,
    paymentMethod: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'P2PExchange',
  });
  return P2PExchange;
};