'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentLinkTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PaymentLinkTransaction.init({
    paymentId: DataTypes.INTEGER,
    status: DataTypes.STRING,
    accepted: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'PaymentLinkTransaction',
  });
  return PaymentLinkTransaction;
};