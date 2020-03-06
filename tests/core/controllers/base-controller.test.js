const supertest = require('supertest');
const path = require('path');
const initConfig = require('../../../dist/core/lib/init-config').default;

global.config = initConfig('config.tests.yaml', path.resolve(__dirname + '/../../data/config/'));

const { FakeDBClient } = require('../../../src/core/tests/fakers/fake-db-client');
const initSQLDumpPath = path.resolve(__dirname + '/../../data/fake-db-client/init-sample-dump.sql');
const { initSqliteDbSettings, deleteSqliteDBFileIfNeed } = require('../../../src/core/tests/helpers/init-sqlite-db');
const sqliteDbSettings = initSqliteDbSettings();
global.dbClient = new FakeDBClient(initSQLDumpPath, sqliteDbSettings.sqliteFile);

const initServer = require('../../../dist/core/lib/init-server').default;
const router = require('../../../src/core/tests/fakers/test-resource-routes').default;
const server = initServer(router);

let request = null;
let app = null;

const resource = global.config.resource;

beforeAll(() => {
  app = server.listen();
  request = supertest.agent(app);
});

afterAll(() => {
  app.close();
  deleteSqliteDBFileIfNeed(sqliteDbSettings);
});

test('Not Found Path', async () => {
  const res = await request.get('/not_found_path');

  expect(res.status).toBe(404);
  expect(res.body.errors).toBeDefined();
  expect(res.body.errors[0]).toBeDefined();
  expect(res.body.errors[0].detail).toBeDefined();
  expect(res.body.errors[0].status).toBe(404);
  expect(res.body.errors[0].detail).toMatch(/GET \/not_found_path/);
});

test(`GET /${resource}`, async () => {
  const res = await request.get(`/${resource}`);

  expect(res.status).toBe(200);
  expect(res.body.errors).toBeUndefined();
  expect(res.body.data.length).toBe(4);
  expect(res.body.data[2].attributes.info).toBe('test3');
});

test(`GET /${resource}#common`, async () => {
  const res = await request.get(`/${resource}`);

  expect(res.status).toBe(200);
  expect(res.body.errors).toBeUndefined();
  expect(res.body.data.length).toBeDefined();
  expect(res.body.data[0].id).toBeDefined();
  expect(res.body.data[0].type).toBeDefined();
  expect(res.body.data[0].attributes).toBeDefined();
});

test(`GET /${resource}#links`, async () => {
  const res = await request.get(`/${resource}`);

  expect(res.body.links).toBeDefined();
  expect(res.body.links.self).toBeDefined();
  expect(res.body.links.first).toBeDefined();
  expect(res.body.links.last).toBeDefined();
});
