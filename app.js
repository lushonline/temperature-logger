const { v4: uuidv4 } = require('uuid');
const asciitable = require('asciitable');
const consola = require('consola');
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
/*   await db.sequelize
    .sync()
    .then(async () => {
      consola.log('connected to database');
      await db.Reading.destroy({
        truncate: true,
      });
    })
    .catch((err) => {
      consola.error(err);
    }); */

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

    const result = {
      sensorId: uuidv4(),
      value: 99.99,
      units: 'C',
    };

    await db.Reading.create(result).then((sqlresult) => {
      consola.log(asciitable([sqlresult.dataValues]));
    });

    if (counter > 10) {
      clearInterval(intervalObj);
    }
  }, process.env.INTERVAL);
};

main();
