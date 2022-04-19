require('dotenv').config();
const consola = require('consola');
const ds18b20 = require('./lib/ds18b20');

// models
const db = require('./models');

// ------------------------------------------------------------------------------------
const main = async () => {
  try {
    await db.sequelize.authenticate({
      logging: process.env.NODE_ENV === 'production' ? false : consola.log,
    });
    consola.log(`Connection has been established successfully. SQLITE3 DB: ${db.config.storage}`);
  } catch (error) {
    consola.error('Unable to connect to the database:', error);
    process.exit(1);
  }

  const sensors = ds18b20.getSensorsSync();
  const results = ds18b20.getAllTemperatureSync(sensors);

  results.map(async (result) => {
    consola.info(`SensorId: ${result.sensorId} Value: ${result.value} ${result.units}`);
    await db.Reading.create(result, {
      isNewRecord: true,
      logging: process.env.NODE_ENV === 'production' ? false : consola.log,
    })
      .then(() => {
        db.sequelize.close();
      })
      .catch((err) => {
        consola.error(err);
      });
  });
};

main();
