'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Widget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Widget.init({
    userId: DataTypes.INTEGER,
    websiteDomain: DataTypes.STRING,
    taxId: DataTypes.STRING,
    paymentTypes: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Widget',
  });
  return Widget;
};