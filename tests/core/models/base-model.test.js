'use strict';
const path = require('path');

const initConfig = require('../../../dist/core/lib/init-config').default;
global.config = initConfig('config.tests.yaml', path.resolve(__dirname + '/../../data/config/'));

const { FakeDBClient } = require(path.resolve(__dirname + '../../../../src/core/tests/fakers/fake-db-client'));
const { BaseModel } = require('../../../dist/core/models/base-model');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const testDataDir = path.resolve(__dirname + '../../../data/models/base-model');

global.dbClient = new FakeDBClient();

test('BaseModel#validation : valid data', async () => {
  const data = JSON.parse(await readFile(`${testDataDir}/sample-data.valid.json`, 'utf8'));
  const baseModel = new BaseModel({ mainTable: 'sample-table' }, `${testDataDir}/main-table.schema.json`, 100);
  const valid = await baseModel.validate(data);

  expect(valid).toBe(true);
});

test('BaseModel#validation : invalid data (not match to schema)', async () => {
  const data = JSON.parse(await readFile(`${testDataDir}/sample-data.invalid.json`, 'utf8'));
  const baseModel = new BaseModel({ mainTable: 'sample-table' }, `${testDataDir}/main-table.schema.json`, 100);
  const valid = await baseModel.validate(data);

  expect(valid).toBe(false);
});

test("BaseModel#validation : invalid data ('strict' mode, not defined required property)", async () => {
  const data = JSON.parse(await readFile(`${testDataDir}/sample-data.valid.json`, 'utf8'));
  delete data.title;
  const baseModel = new BaseModel({ mainTable: 'sample-table' }, `${testDataDir}/main-table.schema.json`, 100);
  const valid = await baseModel.validate(data);

  expect(valid).toBe(false);
});

test("BaseModel#validation : invalid data ('soft' mode, not defined required property)", async () => {
  const data = JSON.parse(await readFile(`${testDataDir}/sample-data.valid.json`, 'utf8'));
  delete data.title;
  const baseModel = new BaseModel({ mainTable: 'sample-table' }, `${testDataDir}/main-table.schema.json`, 100);
  const valid = await baseModel.validate(data, 'soft');

  expect(valid).toBe(true);
});
