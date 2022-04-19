const { v4: uuidv4 } = require('uuid');
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

// eslint-disable-next-line no-unused-vars
const dummyGetReadings = () => {
  return [
    {
      sensorId: uuidv4(),
      value: 99.99,
      units: 'C',
    },
  ];
};

// eslint-disable-next-line no-unused-vars
const getReadings = () => {
  return ds18b20.getAllTemperatureSync();
};

// ------------------------------------------------------------------------------------
const main = async () => {
  try {
    await db.sequelize.authenticate();
    consola.log('Connection has been established successfully.');
  } catch (error) {
    consola.error('Unable to connect to the database:', error);
    process.exit(1);
  }

  let counter = 0;

  const intervalObj = setInterval(async () => {
    counter += 1;

    const result = getReadings();

    result.map(async (value) => {
      await db.Reading.create(value, { isNewRecord: true }).catch((err) => {
        consola.error(err);
      });
    });

    if (counter > 10) {
      clearInterval(intervalObj);
    }
  }, process.env.INTERVAL);
};

main();
