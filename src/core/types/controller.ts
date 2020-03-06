import { Context } from 'koa';

export interface IBaseController {
  getByParams: (ctx: Context) => Promise<void>;
  getOne: (ctx: Context) => Promise<void>;
  create: (ctx: Context) => Promise<void>;
  update: (ctx: Context) => Promise<void>;
  delete: (ctx: Context) => Promise<void>;
}
