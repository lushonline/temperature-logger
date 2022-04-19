const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const promiseRetry = require('promise-retry');

const globpromise = (pattern, options) => {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) => (err === null ? resolve(files) : reject(err)));
  });
};

const parseData = (data) => {
  const arr = data.split('\n');

  if (arr[0].indexOf('YES') > -1) {
    const output = data.match(/t=(-?(\d+))/);
    return Math.round(output[1] / 100) / 10;
  }
  if (arr[0].indexOf('NO') > -1) {
    return false;
  }
  throw new Error('Can not get temperature');
};

const getSensorsSync = () => {
  const pattern = '/sys/bus/w1/devices/28-*';
  let files = glob.sync(pattern);
  files = files.map((f) => path.normalize(f));
  return files;
};

const getSensors = () => {
  return promiseRetry(
    async (retry) => {
      const pattern = '/sys/bus/w1/devices/28-*';
      let files = await globpromise(pattern).catch((e) => {
        if (e.code === 'ENOENT') {
          retry(e);
        }
        throw e;
      });

      files = files.map((f) => path.normalize(f));
      return files;
    },
    {
      retries: 10,
      minTimeout: 100,
      factor: 1,
    }
  );
};

const getTemperature = (sensorPath, sensorId) => {
  return promiseRetry(
    async (retry) => {
      const buf = await fs.readFile(sensorPath).catch((e) => {
        if (e.code === 'ENOENT') {
          retry(e);
        }
        throw e;
      });
      const strData = buf.toString('utf8');
      if (strData.length === 0) {
        retry(new Error('read failed'));
      }

      return { sensorId, units: 'C', value: parseData(strData) };
    },
    {
      retries: 10,
      minTimeout: 100,
      factor: 1,
    }
  );
};

const getAllTemperature = (sensors) => {
  const promises = sensors.map((sensorPath) => {
    return getTemperature(path.join(sensorPath, '/w1_slave'), path.basename(sensorPath));
  });
  return Promise.allSettled(promises);
};

const getTemperatureSync = (sensorPath, sensorId) => {
  const data = fs.readFileSync(sensorPath, 'utf8');
  return { sensorId, units: 'C', value: parseData(data) };
};

const getAllTemperatureSync = (sensors) => {
  return sensors.map((sensorPath) => {
    return getTemperatureSync(path.join(sensorPath, '/w1_slave'), path.basename(sensorPath));
  });
};

module.exports = {
  getSensors,
  getTemperature,
  getAllTemperature,
  getSensorsSync,
  getTemperatureSync,
  getAllTemperatureSync,
};
