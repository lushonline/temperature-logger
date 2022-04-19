const fs = require('fs');
const path = require('path');
const glob = require('glob');

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

const getTemperatureSync = (sensorPath, sensorId) => {
  const data = fs.readFileSync(sensorPath, 'utf8');
  return { sensorId, units: 'C', value: parseData(data) };
};

const getAllTemperatureSync = () => {
  const results = getSensorsSync().map((sensorPath) => {
    return getTemperatureSync(path.join(sensorPath, '/w1_slave'), path.basename(sensorPath));
  });
  return results;
};

module.exports = {
  getSensorsSync,
  getTemperatureSync,
  getAllTemperatureSync,
};
