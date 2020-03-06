const path = require('path');

const initConfig = require('../../../dist/core/lib/init-config').default;
global.config = initConfig('config.tests.yaml', path.resolve(__dirname + '/../../data/config/'));

const logFilePath = path.resolve(__dirname, '../../../http.log');
global.config.logSettings = {
  level: 'debug',
  format: 2,
  colorize: false,
  transports: 'file',
  filename: 'http.log'
};

const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

const { httpLogger } = require('../../../dist/core/middlewares').default;

const clearTestLogs = path => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};

afterAll(() => {
  clearTestLogs(logFilePath);
});

const OUTPUT_LOG_TIMEOUT = 1000;

test('Not Found Middleware', async done => {
  const guidHeader = 'test';
  const ctx = {
    header: {
      [guidHeader]: 123
    },
    guidHeader,
    method: 'GET',
    originalUrl: 'urlTest',
    status: 200,
    length: 42
  };

  const message = 'GET urlTest :: 200 :: guId - 123 :: 42b';
  const promise = () => new Promise((resolve, rejected) => resolve());
  await httpLogger(ctx, promise);

  setTimeout(async () => {
    const outputLogData = await readFile(logFilePath, 'utf8');
    const outputLog = JSON.parse(outputLogData);

    expect(outputLog.level).toBe('info');
    expect(outputLog.message).toBeDefined();
    expect(outputLog.message.includes(message)).toBe(true);

    done();
  }, OUTPUT_LOG_TIMEOUT);
});
