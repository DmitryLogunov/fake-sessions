'use strict';

const randomstring = require('randomstring');
const path = require('path');

const { FakeDBClient } = require('../../../../src/core/tests/fakers/fake-db-client');
const initSQLDumpPath = path.resolve(__dirname + '/../../../data/fake-db-client/init-sample-dump.sql');
const { initSqliteDbSettings, deleteSqliteDBFileIfNeed } = require('../../../../src/core/tests/helpers/init-sqlite-db');
const sqliteDbSettings = initSqliteDbSettings();
const fakeDBClient = new FakeDBClient(initSQLDumpPath, sqliteDbSettings.sqliteFile);

const initConfig = require('../../../../dist/core/lib/init-config').default;
global.config = initConfig('config.tests.yaml', path.resolve(__dirname + '/../../../data/config/'));

afterAll(() => {
  fakeDBClient.close();
  deleteSqliteDBFileIfNeed(sqliteDbSettings);
});

test('FakeDBClient#query', async () => {
  const result = await fakeDBClient.query('SELECT * FROM `test_table` WHERE id = 2');

  expect(result.data[0].info).toBe('test2');
});

test('FakeDBClient#run', async () => {
  const sampleId = 100;
  const sampleInfo = randomstring.generate();

  await fakeDBClient.query(`INSERT INTO test_table (id, info) VALUES (${sampleId}, '${sampleInfo}')`);
  const result = await fakeDBClient.query(`SELECT * FROM test_table WHERE id = '${sampleId}'`);

  expect(result.data[0].info).toBe(sampleInfo);
});

test('FakeDBClient#run', async () => {
  const sampleInfo = randomstring.generate();
  const result = await fakeDBClient.query(`INSERT INTO test_table (info) VALUES ('${sampleInfo}')`);

  expect(result.status).toBeTruthy();
  expect(result.data.insertId).toBeGreaterThan(0);
});
