const fs = require('fs');
const faker = require('faker');
const { map } = require('lodash');

exports.addSreComments = async (dbClient, insertTemplatePath, number) => {
  const dictionariesResources = await dbClient.query("SELECT *FROM dictionaries as d WHERE d.title = 'maintenances' OR d.title = 'incidents'");
  const resourcesIDS = map(dictionariesResources.data, rows => rows.id);

  const commentTypes = await dbClient.query("SELECT *FROM dictionaries as d WHERE d.type = 'comment_type'");
  const commentTypesIDS = map(commentTypes.data, rows => rows.id);

  const insertTemplate = fs.readFileSync(insertTemplatePath, 'utf-8');
  const roles = [];
  for (i = 0; i < number; i++) {
    let sql = insertTemplate;
    let account_id = faker.random.number();
    let context_resource = resourcesIDS[exports.getRandomInt(0, resourcesIDS.length - 1)];
    let context_id = faker.random.number();
    let comment_type = commentTypesIDS[exports.getRandomInt(0, commentTypesIDS.length - 1)];;
    const source_id = faker.random.number();
    const text = faker.lorem.text();

    sql = sql.replace('{{account_id}}', account_id);
    sql = sql.replace('{{context_resource}}', context_resource);
    sql = sql.replace('{{context_id}}', context_id);
    sql = sql.replace('{{comment_type}}', comment_type);
    sql = sql.replace('{{text}}', text);
    sql = sql.replace('{{source_id}}', source_id);
    const res = await dbClient.query(sql);
    roles.push({ id: res.data.insertId, account_id, context_resource, context_id, comment_type, text, source_id });
  }
  return roles;
};

exports.getSampleSreComment = async dbClient => {
  const dictionariesResources = await dbClient.query("SELECT *FROM dictionaries as d WHERE d.title = 'maintenances' OR d.title = 'incidents'");
  const contextResources = map(dictionariesResources.data, row => {
    return { id: row.id, title: row.title };
  });

  const commentTypes = await dbClient.query("SELECT *FROM dictionaries as d WHERE d.type = 'comment_type'");
  const commentTypesIDS = map(commentTypes.data, rows => rows.id);

  const accounts = await dbClient.query('SELECT *FROM accounts');
  const accountsIDs = map(accounts.data, row => row.id);

  const account_id = accountsIDs[exports.getRandomInt(0, accountsIDs.length - 1)];
  const contextResource = contextResources[exports.getRandomInt(0, contextResources.length - 1)];
  const context_resource_id = contextResource.id;
  const context_resource_title = contextResource.title;
  const comment_type = commentTypesIDS[exports.getRandomInt(0, commentTypesIDS.length - 1)];;
  const source_id = faker.random.number();
  const text = faker.lorem.text();

  return {
    attributes: { text },
    relationships: {
      account: { data: { type: 'accounts', id: `${account_id}` } },
      resource_type: { data: { type: 'dictionaries', id: `${context_resource_id}` } },
      context: { data: { type: context_resource_title, id: `${exports.getRandomInt(100, 1000)}` } },
      comment_type: { data: { type: 'comment_type', id: `${comment_type}` } }
    }
  };
};

exports.getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};