const { resolve } = require('path');
const ParseBody = require(resolve(__dirname, '../../../../dist/core/controllers/helpers/data-helper')).default;
const fs = require('fs');

const { throws } = require('smid');

let bodyHelper;
const resource = 'test-resource';
beforeAll(() => {
  const schema = JSON.parse(
    fs.readFileSync(resolve(__dirname, '../../../../src/core/tests/fakers/models/schemas/main-table.schema.json'))
  );
  bodyHelper = new ParseBody(resource, schema);
});

const firstIdShard = 10000;
const secondIdShard = 20000;
const firstId = 42;
const secondId = 101;
const data = {
  data: {
    type: resource,
    attributes: { info: 'info' },
    relationships: {
      resource_first: {
        data: { type: 'test-type', id: firstId + firstIdShard }
      },
      resource_second: {
        data: { type: 'test-type', id: secondId + secondIdShard }
      }
    }
  }
};

test('Prase Body#Successfully', () => {
  const body = bodyHelper.parseBody(data);

  expect(body.info).toBeDefined();
  expect(body.relationships_first_id).toBeDefined();
  expect(body.relationships_first_id).toBe(firstId);
  expect(body.relationships_second_id).toBeDefined();
  expect(body.relationships_second_id).toBe(secondId);
});

test('Prase Body#Usuccessfully', () => {
  const newData = { ...data };
  newData.data.type = 'unknown_resource_type';
  const body = throws(() => bodyHelper.parseBody(newData));

  expect(body.message).toBeDefined();
  expect(body.message).toBe('Unknown Resource Type');
  expect(body.statusCode).toBeDefined();
  expect(body.statusCode).toBe(400);
});
