import { getRelationshipTable } from '../../core/helpers/config';
import { DBClient } from '../../core/lib/db-client';
import { BaseModel } from '../../core/models/base-model';
import { ITables } from '../../core/types/config';
import { IDBResult } from '../../core/types/db-client';
import { IFilterWithOperands, IKeyValue } from '../../core/types/helpers';

import path from 'path';

/**
 * Implemets the base functionality of model
 */
export default class SessionsModel extends BaseModel {
  constructor(tables: ITables, schemaPath?: string, limit?: number, dbClient?: DBClient) {
    super(tables, schemaPath || path.resolve(__dirname + '/schema.json'), limit, dbClient);
  }  
}
