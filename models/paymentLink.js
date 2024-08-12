'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentLink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PaymentLink.init({
    userId: DataTypes.INTEGER,
    paymentType: DataTypes.STRING,
    productName: DataTypes.STRING,
    productImage: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    currency: DataTypes.STRING,
    paymentCode: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'PaymentLink',
  });
  return PaymentLink;
};