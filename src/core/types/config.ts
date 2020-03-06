import { isOptionalMemberExpression } from '@babel/types';
import { IBaseController } from '.';
import { IBaseModel } from './model';

export interface IDBSettings {
  notEnabled?: boolean;
  host: string;
  user: string;
  password: string;
  port: number;
  connectionLimit: number;
}

export interface ILogSettings {
  level: string;
  format: number;
  colorize: boolean;
  transports?: string;
  filename?: string;
}

export interface ITables {
  mainTable: string;
  actionTable: string;
}

export interface IResource {
  name: string;
  prefix: string;
  methods: string[];
  tables: ITables;
}

export interface IRelationshipLink {
  name: string;
  table: string;
}
export interface IRelationship {
  resource: string;
  links: IRelationshipLink[];
}

export interface IUser {
  username: string;
  password: string;
}

export interface IConfig {
  port: number;
  version?: string;
  resource: string;
  reqGuidHeader: string;
  defaultLimit: number;
  logSettings: ILogSettings;
  dbSettings: IDBSettings;
  users: IUser[];
  relationships: IRelationship[];
  resources: IResource[];
}

export interface IResourceSettings {
  controller: any;
  model: any;
}

export interface IResourcesSettings {
  [key: string]: IResourceSettings;
}
