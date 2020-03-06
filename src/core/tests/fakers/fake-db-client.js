'use strict';

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

/**
 * Implemets the fake class for DBClient
 */
class FakeDBClient {
  /**
   * FakeDBClient constructor
   *
   * @param {*} initSQLDumpPath  optional, path to SQL init dump
   * @param {*} sqliteFilePath   otpional, path to local SQLite file; as default the SQLite base creates in ':memory:' mode
   */
  constructor(initSQLDumpPath, sqliteFilePath) {
    this.sqliteFilePath = sqliteFilePath;

    const storage = sqliteFilePath || ':memory:';
    try {
      this.dbClient = new sqlite3.Database(storage);
      console.log('Test SQLite DB is established.');

      if (initSQLDumpPath) {
        this.initDB(initSQLDumpPath);
        console.log('The init SQL dump has been uploaded');
      }
    } catch (e) {
      console.log('Error: Test SQLite DB has not been established!');
    }
  }

  /**
   * Removes SQLite file storage if it exists
   */
  removeFileStorage() {
    if (!this.sqliteFilePath || !fs.existsSync(this.sqliteFilePath)) return;
    fs.unlinkSync(this.sqliteFilePath);
  }

  /**
   * Closes DB
   */
  close() {
    this.dbClient.close();
  }

  /**
   *  Initiates DB with sqlDump from file
   *
   * @param {*} initSQLDumpPath
   */
  initDBFromListQueries(initSQLDumpPath) {
    if (!initSQLDumpPath) return;

    const sqlInitDump = fs.readFileSync(initSQLDumpPath, 'utf8');
    const queries = sqlInitDump.split(';\n');

    let dumpQueriesIndex = 0;
    this.dbClient.serialize(() => {
      for (var i = 0; i < queries.length; i++) {
        try {
          console.log(`Run query: ${queries[i]}`);
          this.dbClient.run(queries[i]);
          dumpQueriesIndex += 1;
        } catch (e) {
          console.log(`Error: there is mistake inSQL query: '${queries[i]}'`);
        }
      }
    });

    return dumpQueriesIndex;
  }

  /**
   *  Initiates DB with sqlDump from file
   *
   * @param {*} initSQLDumpPath
   */
  initDB(initSQLDumpPath) {
    if (!initSQLDumpPath) return;

    const sqlInitDump = fs.readFileSync(initSQLDumpPath, 'utf8');

    try {
      this.dbClient.exec(sqlInitDump);
    } catch (e) {
      console.log('Error: there is mistake with executing initial database sql dump');
    }
  }

  /**
   * Implements executing SQL query to database
   *
   * @param sql
   * @returns Promise<IDBResult>
   */
  query(sql, params) {
    return new Promise((resolve, reject) => {
      this.dbClient.serialize(() => {
        if (sql.match(/SELECT/)) return this.select(sql, params, resolve);
        if (sql.match(/INSERT/)) return this.insert(sql, params, resolve, reject);
        return this.run(sql, params, resolve, reject); /* UPDATE, CREATE, DELETE */
      });
    });
  }

  /**
   * Select query
   */
  select(sql, params, resolve) {
    this.dbClient.all(sql, params, (err, rows) => {
      if (err) {
        resolve({ data: [], status: false, message: err.message });
      }
      resolve({ data: rows, status: true });
    });
  }

  /**
   * Insert new row
   */
  insert(sql, params, resolve, reject) {
    return this.dbClient.run(sql, params, err => {
      if (err) {
        console.log(
          `Error: there is mistake in SQL query. SQL: '${sql}', params: '${JSON.stringify(params)}', error: ${err}`
        );
        reject(err);
      }

      this.query(`SELECT LAST_INSERT_ROWID() as last_insert_id`).then(rows => {
        if (!(rows.data && rows.data.length > 0 && rows.data[0] && rows.data[0]['last_insert_id'] !== null)) {
          const paramsLog = params ? `, params: '${JSON.stringify(params)}'` : '';
          console.log(
            `Error: SQL request haven't been succefully executed (it's not possible to get last insert id). SQL: '${sql}' ${paramsLog}, error: ${err}`);
          reject(err);
        }
        const insertId = parseInt(rows.data[0]['last_insert_id']);
        resolve({ data: { insertId }, status: true });
      });
    });
  }

  /**
   * Execute CREATE, UPDATE and DELETE queries
   */
  run(sql, params, resolve, reject) {
    const dbRunHandler = (sql, params, resolve, reject) => {
      this.dbClient.run(sql, params, err => {
        if (err) {
          console.log(
            `Error: there is mistake in SQL query. SQL: '${sql}', params: '${JSON.stringify(params)}', error: ${err}`
          );
          reject(err);
        }
        resolve({ data: { affectedRows: 1, changedRows: true }, status: true });
      });
    };

    if (sql.match(/UPDATE/)) {
      let selectSQL = sql.replace(/[\s]*SET([\s]*[`]*[a-zA-Z_]+[`]*=\?[,]*[\s]*)+/, ' ');
      const parsedSQL = sql.match(/([\s]*[`]*[a-zA-Z_]+[`]*=\?[,]*[\s]*)+/);
      const setParamsList = parsedSQL[0].split('=?');
      selectSQL = selectSQL.replace('UPDATE ', 'SELECT COUNT(*) as cnt FROM ');
      let whereParams = Object.assign([], params);
      whereParams.splice(0, setParamsList.length - 1);

      this.query(selectSQL, whereParams).then(rows => {
        if (rows.data && rows.data.length > 0 && rows.data[0]['cnt'] !== null && parseInt(rows.data[0]['cnt']) > 0) {
          dbRunHandler(sql, params, resolve, reject);
        } else {
          resolve({ data: { affectedRows: 0, changedRows: false }, status: true });
        }
      });
    }

    dbRunHandler(sql, params, resolve, reject);
  }
}

exports.FakeDBClient = FakeDBClient;
