import Ajv from 'ajv';
import fs from 'fs';
import findKey from 'lodash/findKey';
import stackTrace from 'stack-trace';
import { DBClient, logger } from '../lib';
import { IFilterWithOperands, IKeyValue } from './../types/helpers';
import { IBaseModel } from './../types/model';

import { ITables } from '../types/config';
import { IDBClient, IDBResult } from '../types/db-client';

const { defaultLimit } = global.config;

export class BaseModel implements IBaseModel {
  protected dbClient: IDBClient;
  protected schemaPath: string;
  protected mainTable: string;
  protected actionTable: string;
  private limit: number;
  private operands: IKeyValue;
  private schema: any;
  private validator: any;

  constructor(tables: ITables, schemaPath?: string, limit?: number, dbClient?: DBClient) {
    this.dbClient = dbClient || global.dbClient;
    if (!global.config.dbSettings.notEnabled && !this.dbClient) {
      logger.error(`Database client is not established!`, null, stackTrace.get());
      process.exit(1);
    }

    this.schemaPath = schemaPath;
    this.mainTable = tables.mainTable as string;
    this.actionTable = (tables.actionTable || tables.mainTable) as string;
    this.limit = limit || defaultLimit;
    this.operands = {
      eq: '=?',
      gt: '>?',
      gte: '>=?',
      lt: '<?',
      lte: '<=?',
      ne: '<>?'
    };
  }

  /**
   * Returns validation schema
   *
   * @returns {any}
   */
  public getSchema(): any {
    if(!this.schemaPath) {
      return;
    }

    if (!this.schema) {
      this.schema = JSON.parse(fs.readFileSync(this.schemaPath, 'utf8'));
    }

    return { ...this.schema };
  }

  /**
   * Set parameter this.limit;
   *
   * @param limit
   */
  public setLimit(limit: number): void {
    this.limit = limit;
  }

  /**
   * Returns all rows of 'mainTable'
   *
   * @returns {Promise<IDBResult>}
   */
  public getAll(): Promise<IDBResult> {
    const sql = `SELECT * FROM ${this.mainTable}`;

    const result = this.dbClient.query(sql);
    return result;
  }

  /**
   * Returns the rows of 'readTable' filtered by params
   * Use only this.readTable
   *
   * @param filter
   * @param page
   * @returns {Promise<IDBResult>}
   */
  public async getByParams(filter: IFilterWithOperands, page: number = 0): Promise<IDBResult> {
    const params = await this.changeKeys(filter);
    const validateParams: IKeyValue = {};
    for (const key in params) {
      if (filter.hasOwnProperty(key)) {
        validateParams[key] = params[key][0];
      }
    }

    const isValid = await this.validate(validateParams, 'soft');
    if (!isValid) {
      return { status: false, message: 'Invalid params' } as IDBResult;
    }

    const where = await this.filter(params);
    const sql = `SELECT * FROM ${this.mainTable} ${where.string} ${this.limitation(page)}`;
    const result = this.dbClient.query(sql, where.values);
    return result;
  }

  /**
   * Returns the row of 'readTable' filtered by 'field' and 'value (if 'field' is not defined than it's filtered by primary field)
   * Use only this.readTable
   *
   * @param value
   * @param field
   * @returns {Promise<IDBResult>}
   */
  public async getRowByField(value: string, field?: string): Promise<IDBResult> {
    const primaryField = field || (await this.getPrimaryField());

    if (!primaryField) {
      return { status: false, message: 'Bad Request' } as IDBResult;
    }

    const filter: IFilterWithOperands = {
      [primaryField]: [value, 'eq']
    };

    const result = this.getByParams(filter);
    return result;
  }

  /**
   * Inserts new row into the this.mainTable
   *
   * @param payload
   * @returns {Promise<IDBResult>}
   */
  public async create(payload: IKeyValue, table?: string): Promise<IDBResult> {
    const targetTable: string = table || this.actionTable;
    const isValid = await this.validate(payload);
    if (!isValid) {
      return { status: false, message: 'Invalid payload' } as IDBResult;
    }

    const newPayload = await this.changeKeys(payload);
    const [keys, values] = this.splitPayload(newPayload);

    const symbols = '?, '.repeat(keys.length).slice(0, -2);
    const insertKeys = '`' + keys.join('`, `') + '`';
    const sql = `INSERT INTO ${targetTable} (${insertKeys}) VALUES (${symbols})`;

    const result = this.dbClient.query(sql, values);
    return result;
  }

  /**
   * Updates the rows filtered by filter
   *
   * @param payload
   * @param filter
   * @returns {Promise<IDBResult>}
   */
  public async update(payload: IKeyValue, filter: IKeyValue, table?: string): Promise<IDBResult> {
    const targetTable: string = table || this.actionTable;

    const isValid = await this.validate(payload, 'soft');
    if (!isValid) {
      return { status: false, message: 'Invalid payload' } as IDBResult;
    }

    const newPayload = await this.changeKeys(payload);
    const [keys, values] = this.splitPayload(newPayload);

    const params = await this.changeKeys(filter);
    const where = await this.filter(params);
    const column = keys.map(key => '`' + key + '`' + '=?').join(', ');
    const sql = `UPDATE ${targetTable}  SET ${column} ${where.string}`;

    const result = this.dbClient.query(sql, [...values, ...where.values]);
    return result;
  }

  /**
   * Deletes the rows from 'actionTable' filtered by filter params
   * Use only this.actionTable
   *
   * @param filter
   * @returns {Promise<IDBResult>}
   */
  public async delete(filter: IKeyValue, table?: string): Promise<IDBResult> {
    const targetTable: string = table || this.actionTable;
    const isValid = await this.validate(filter, 'soft');
    if (!isValid) {
      return { status: false, message: 'Invalid params' } as IDBResult;
    }

    const params = await this.changeKeys(filter);
    const where = await this.filter(params);

    const sql = `DELETE FROM ${targetTable} ${where.string}`;

    const result = this.dbClient.query(sql, where.values);
    return result;
  }

  /**
   * Get the count of all rows in the table
   *
   * @returns {Promise<IDBResult>}
   */
  public async getCountOfTable(filter: IFilterWithOperands, table?: string): Promise<IDBResult> {
    const targetTable: string = table || this.actionTable;
    const params = await this.changeKeys(filter);

    const validateParams: IKeyValue = {};
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        validateParams[key] = params[key][0];
      }
    }

    const isValid = await this.validate(validateParams, 'soft');
    if (!isValid) {
      return { status: false, message: 'Invalid params' } as IDBResult;
    }

    const where = await this.filter(params);
    const sql = `SELECT COUNT(*) as count FROM ${targetTable} ${where.string}`;

    const result = this.dbClient.query(sql, where.values);
    return result;
  }

  /**
   * Validates payload according to the this.actionTable schema
   *
   * @param payload
   * @param mode
   * @returns {Promise<boolean>}
   */
  protected async validate(payload: IKeyValue, mode: string = 'strong'): Promise<boolean> {
    const schema = await this.getSchema();

    if (!this.validator) {
      const strongAjv = new Ajv({ schemaId: 'auto' });
      const strongValidator = strongAjv.compile(schema);

      schema.required = [];
      const softAjv = new Ajv({ schemaId: 'auto' });
      const softValidator = softAjv.compile(schema);

      this.validator = { strong: strongValidator, soft: softValidator };
    }

    const valid = this.validator[mode](payload);
    if (!valid) {
      logger.debug(
        'Object is invalid',
        {
          errors: JSON.stringify(this.validator[mode].errors),
          mode,
          payload: JSON.stringify(payload),
          readTable: this.mainTable
        },
        stackTrace.get()
      );
    }
    return valid;
  }

  /**
   * Creates SQL filter string such as "WHERE key1=? AND key2<>? AND kye3>=?"
   *
   * @param params
   * @returns { string: string; values: string[] }
   */
  protected async filter(params: IKeyValue | IFilterWithOperands): Promise<{ string: string; values: string[] }> {
    if (typeof params !== 'object') {
      return { string: '', values: [] };
    }

    const arrParams: string[] = Object.keys(params).map(item => {
      if (Array.isArray(params[item])) {
        const operand: string = String(this.operands[params[item][1]]);
        return `${this.mainTable + '.' + item + operand}`;
      }
      return `${this.mainTable + '.' + item + '=?'}`;
    });

    const stringParams: string = arrParams.length ? 'WHERE '.concat(arrParams.join(' AND ')) : '';
    const values = Object.values(params).map(item => {
      if (Array.isArray(item)) {
        return String(item[0]);
      }
      return String(item);
    });
    const result = {
      string: stringParams,
      values
    };

    return result;
  }

  /**
   * Get primary field for this.mainTable
   *
   * @returns {string}
   */
  protected getPrimaryField(): string {
    const schema = this.getSchema();
    const primaryField = findKey(schema.properties, ['primary', true]);
    return primaryField;
  }

  /**
   * Splits an object into keys and values
   *
   * @param payload IKeyValue
   * @returns {Array}
   */
  protected splitPayload(payload: IKeyValue): [string[], string[]] {
    const [keys, values] = [Object.keys(payload), Object.values(payload)];
    return [keys, values];
  }

  /**
   * Returns the limitation in SQL format (such as 'LIMIT start, limit')
   *
   * @param page
   * @returns {string}
   */
  protected limitation(page: number = 0): string {
    const limits = page >= 0 ? `LIMIT ${this.limit * page}, ${this.limit}` : '';
    return limits;
  }

  /**
   * Replaces keys with them aliases in payload\
   *
   * @param payload
   * @returns {Promise<any>}
   */
  private async changeKeys<T>(payload: T): Promise<T> {
    if (!this.actionTable) {
      return payload;
    }

    if (this.actionTable === this.mainTable) {
      return payload;
    }

    const schema = await this.getSchema();
    const newPayload: any = {};

    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        const fieldData = schema.properties[key];
        const alias = fieldData ? fieldData.alias : undefined;
        if (alias) {
          const newKey = alias.field_name;
          newPayload[newKey] = payload[key];
        }
      }
    }

    return newPayload;
  }
}
