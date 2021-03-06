/* tslint:disable:no-namespace interface-name */

declare namespace NodeJS {
  interface Global {
    dbClient: import('../core/types/db-client').IDBClient;
    config: import('../core/types/config').IConfig;
    cache: any[];
  }
}

declare module 'stack-trace';
declare module 'koa-respond';
declare module 'is-number';
declare module 'bytes';
declare module 'lodash';
declare module 'js-yaml';
