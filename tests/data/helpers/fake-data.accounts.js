const fs = require('fs');
const faker = require('faker');
const { resolve } = require('path');

exports.addSreUsers = (dbClient, insertUserTemplatePath, usersNumber) => {
  const insertUserTemplate = fs.readFileSync(insertUserTemplatePath, 'utf-8');
  const users = [];
  for (i = 0; i < usersNumber; i++) {
    let sql = insertUserTemplate;
    let first_name = faker.name.findName();
    let last_name = faker.name.lastName();
    let login = `${first_name}.${last_name}`;
    const email = faker.internet.email();
    const phone = faker.phone.phoneNumber();
    const skype_id = faker.phone.phoneNumber();
    const source_id = faker.random.number();
    const double_id = faker.random.number();

    login = login.replace("'", '');
    first_name = first_name.replace("'", '');
    last_name = last_name.replace("'", '');

    sql = sql.replace('{{id}}', i + 1);
    sql = sql.replace('{{first_name}}', first_name);
    sql = sql.replace('{{last_name}}', last_name);
    sql = sql.replace('{{login}}', login);
    sql = sql.replace('{{email}}', email);
    sql = sql.replace('{{phone}}', phone);
    sql = sql.replace('{{skype_id}}', login);
    sql = sql.replace('{{source_id}}', source_id);
    sql = sql.replace('{{double_id}}', double_id);
    global.dbClient.query(sql);
    users.push({ id: i + 1, login, first_name, last_name, email, phone, source_id, double_id });
  }
  return users;
};

exports.getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

exports.getSampleUser = () => {
  const first_name = faker.name.findName();
  const last_name = faker.name.lastName();
  const login = `${first_name}.${last_name}`;
  const timeZones = ['America/Los_Angeles', 'Etc/GMT', 'Europe/Kiev', 'Europe/Moscow', 'US/Pacific', 'America/Denver'];
  const boolenVars = ['0', '1'];

  return {
    login,
    first_name,
    last_name,
    title: faker.random.words(),
    time_zone: timeZones[exports.getRandomInt(0, 7)],
    email: faker.internet.email(),
    phone: faker.phone.phoneNumber(),
    city: faker.random.word(),
    state: faker.random.word(),
    country: faker.random.word(),
    is_active: boolenVars[exports.getRandomInt(0, 2)],
    is_terminate: boolenVars[exports.getRandomInt(0, 2)]
  };
};
