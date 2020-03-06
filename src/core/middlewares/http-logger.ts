import bytes from 'bytes';
import { Context } from 'koa';
import { logger } from '../lib';

export default async (ctx: Context, next: () => Promise<any>) => {
  const start = Date.now();

  try {
    await next();
  } finally {
    const end = Date.now() - start;
    const guId = ctx.header[ctx.guidHeader] || 'none';
    const startMsg = `${ctx.method} ${ctx.originalUrl} :: ${ctx.status} :: guId - ${guId}`;
    const length = bytes(ctx.length || 0).toLowerCase();

    logger.info(`${startMsg} :: ${length} :: ${end}ms`);
  }
};
