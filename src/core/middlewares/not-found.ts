import { Context } from 'koa';

export default async (ctx: Context) => {
  const path = `${ctx.request.method} ${ctx.request.path}`;
  const detail = `No endpoint matched your request: ${path}`;
  const errors = [{ detail, status: 404 }];
  ctx.notFound({ errors });
};
