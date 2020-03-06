'use strict';
const path = require('path');
const initConfig = require('../../../../dist/core/lib/init-config').default;
global.config = initConfig('config.comments.yaml', path.resolve(__dirname + '/../../../data/config/'));

const { getRelationshipTable } = require('../../../../dist/core/helpers/config');

test(`Check 'core/helpers/config#getRelationshipTable'`, async () => {
  const dictionariesTable = getRelationshipTable('comments', 'dictionaries');
  expect(dictionariesTable).toBe('dictionaries');
});
