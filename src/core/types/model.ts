import { IDBClient, IDBResult } from './db-client';
import { IKeyValue } from './helpers';

export interface IBaseModel {
  getSchema: () => Promise<any>;
  setLimit: (limit: number) => void;
  getAll: () => Promise<IDBResult>;
  getByParams: (filter: any, page?: number) => Promise<IDBResult>;
  getRowByField: (value: string, field?: string) => Promise<IDBResult>;
  create: (paylaod: IKeyValue, table?: string) => Promise<IDBResult>;
  update: (payload: IKeyValue, filter: IKeyValue, table?: string) => Promise<IDBResult>;
  delete: (filter: IKeyValue, table?: string) => Promise<IDBResult>;
  getCountOfTable: (filter: any) => Promise<IDBResult>;
}
