'use strict';

const path = require('path');
const fs = require('fs');
const uniqid = require('uniqid');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

const initConfig = require('../../../../dist/core/lib/init-config').default;
global.config = initConfig('config.tests.yaml', path.resolve(__dirname + '/../../../data/config/'));

const Logger = require('../../../../dist/core/lib/logger/logger').default;
const stackTrace = require('stack-trace');

const defaultLogfilePath = path.resolve(__dirname + '../../../../../combined.log');

const clearTestLogs = logFilePath => {
  if (fs.existsSync(logFilePath)) {
    fs.unlinkSync(logFilePath);
  }
};

const OUTPUT_LOG_TIMEOUT = 1000;

beforeAll(() => {
  clearTestLogs(defaultLogfilePath);
});

afterAll(() => {
  clearTestLogs(defaultLogfilePath);
});

test('Checking logger#info', async done => {
  const logger = new Logger({
    logLevel: 'debug',
    format: 2,
    colorize: false,
    transports: 'file'
  });

  const message = uniqid();
  const params = { a: uniqid(), b: uniqid() };
  const stacktrace = stackTrace.get();
  const fileName = stacktrace[0]
    .getFileName()
    .split('/')
    .slice(-1)[0];
  const line = stacktrace[0].getLineNumber();

  logger.info(message, params, stacktrace);

  setTimeout(async () => {
    const outputLogData = await readFile(defaultLogfilePath, 'utf8');
    const outputLog = JSON.parse(outputLogData);

    expect(outputLog.level).toBe('info');
    expect(outputLog.message).toBe(message);
    expect(outputLog.params).toEqual(params);
    expect(outputLog.timestamp).not.toBeUndefined();
    expect(outputLog.label).toBe(`${fileName}:${line}`);
    done();
  }, OUTPUT_LOG_TIMEOUT);
});
