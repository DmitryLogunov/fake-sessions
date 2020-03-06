'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const path_1 = __importDefault(require('path'));
const base_model_1 = require(path_1.default.resolve(__dirname + '../../../../../../dist/core/models/base-model'));

const { tables } = global.config;
/**
 * Implemets the base functionality of model
 */
class TestResourceModel extends base_model_1.BaseModel {
  constructor(schemaPath, limit, dbClient) {
    super(tables, schemaPath || path_1.default.resolve(__dirname + '/schemas/main-table.schema.json'), limit, dbClient);
    this.actionTable = tables.actionTable;
  }
  /**
   * Inserts new row into the this.mainTable
   *
   * @param payload
   * @returns Promise<IDBResult>
   */
  async create(payload) {
    return super.create(payload, this.actionTable);
  }
  /**
   * Updates the rows filtered by filter
   *
   * @param payload
   * @param filter
   * @returns Promise<IDBResult>
   */
  async update(payload, filter) {
    return super.update(payload, filter, this.actionTable);
  }
  /**
   * Deletes the rows from 'actionTable' filtered by filter params
   * Use only this.actionTable
   *
   * @param filter
   * @returns boolean
   */
  async delete(filter) {
    return super.delete(filter, this.actionTable);
  }
}
exports.default = TestResourceModel;
