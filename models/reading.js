const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reading extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // define association here
    }
  }
  Reading.init(
    {
      sensorId: DataTypes.STRING,
      value: DataTypes.FLOAT,
      units: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Reading',
    }
  );
  return Reading;
};
