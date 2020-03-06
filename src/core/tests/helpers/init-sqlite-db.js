const fs = require('fs');
const yaml = require('js-yaml');
const { resolve } = require('path');
const { promisify } = require('util');
const mkdirp = require('mkdirp');
const mkSubDir = promisify(mkdirp);

/**
 * Checks if sqlite db file should be created
 */
checkNeedCreateSqliteDBFile = sqliteDbSettings => {
  if (!sqliteDbSettings) return false;
  if (sqliteDbSettings.strategy !== 'file') return false;

  return sqliteDbSettings.sqliteFile;
};

/**
 * Checks if sqlite db file should be deleted before tests start
 */
checkNeedDeleteSqliteDBFileBeforeAll = sqliteDbSettings => {
  if (!checkNeedCreateSqliteDBFile(sqliteDbSettings)) return false;
  if (!fs.existsSync(resolve(process.cwd() + `/${sqliteDbSettings.sqliteFile}`))) return false;

  return sqliteDbSettings.deleteBeforeAll;
};

/**
 * Checks if sqlite db file should be deleted before tests start
 */
checkNeedDeleteSqliteDBFileAfterAll = sqliteDbSettings => {
  if (!checkNeedCreateSqliteDBFile(sqliteDbSettings)) return false;
  if (!fs.existsSync(resolve(process.cwd() + `/${sqliteDbSettings.sqliteFile}`))) return false;

  return sqliteDbSettings.deleteAfterAll;
};

/**
 * Deletes sqlite db file if need
 */
exports.deleteSqliteDBFileIfNeed = sqliteDbSettings => {
  if (checkNeedDeleteSqliteDBFileAfterAll(sqliteDbSettings)) {
    fs.unlinkSync(resolve(process.cwd() + `/${sqliteDbSettings.sqliteFile}`));
  }
};

/**
 * Initalizing sqlite database
 */
exports.initSqliteDbSettings = () => {
  const pathToConfigfile = resolve(process.cwd()) + `/tests/sqlite-db-settings.yaml`;
  if (!fs.existsSync(pathToConfigfile)) {
    return;
  }
  const sqliteDbSettingsFile = fs.readFileSync(pathToConfigfile, 'utf8');
  const sqliteDbSettings = yaml.safeLoad(sqliteDbSettingsFile);

  if (checkNeedCreateSqliteDBFile(sqliteDbSettings)) {
    const parsedSqliteDbFilePath = sqliteDbSettings.sqliteFile.split('/');
    parsedSqliteDbFilePath.pop();
    sqliteDbFilePath = parsedSqliteDbFilePath.join('/');
    if (!fs.existsSync(sqliteDbFilePath)) {
      mkSubDir(sqliteDbFilePath);
    }
  }

  if (checkNeedDeleteSqliteDBFileBeforeAll(sqliteDbSettings)) {
    fs.unlinkSync(resolve(process.cwd() + `/${sqliteDbSettings.sqliteFile}`));
  }

  if (sqliteDbSettings && sqliteDbSettings.strategy === 'memory') {
    delete sqliteDbSettings.sqliteFile;
  }

  return sqliteDbSettings;
};
