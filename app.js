const consola = require('consola');
const ds18b20 = require('./lib/ds18b20');

// models
const db = require('./models');

require('dotenv').config();

// Check the environment variables are configured in the .env file
if (!process.env.INTERVAL) {
  consola.error(
    'Missing critical env vars. Make sure all variables are defined in .env file. Aborting. '
  );
  process.exit(1);
}

// ------------------------------------------------------------------------------------
const main = async () => {
  try {
    await db.sequelize.authenticate();
    consola.log('Connection has been established successfully.');
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
    }).catch((err) => {
      consola.error(err);
    });
  });
};

main();
