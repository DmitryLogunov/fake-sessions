import { Context } from 'koa';
import stackTrace from 'stack-trace';
import { logger } from '../lib';

export default async (ctx: Context, next: () => Promise<any>) => {
  try {
    await next();
  } catch (e) {
    logger.error(`Error caught in handler`, { message: e.message }, stackTrace.get());
    const status = e.statusCode || 500;
    const detail = e.message;
    const errors = [{ detail, status }];
    ctx.send(status, { errors });
  }
};
