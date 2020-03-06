import Http from 'http';
import Koa from 'koa';
import body from 'koa-body';
import { ComposedMiddleware } from 'koa-compose';
import respond from 'koa-respond';
import stackTrace from 'stack-trace';
import { logger } from '..';
import middleware from '../../middlewares';

/**
 * Initialize Koa server
 *
 * @param router
 * @returns {Http.Server}
 */
export default (router: () => ComposedMiddleware<any>): Http.Server => {
  logger.debug('Creating server...');
  const koa: Koa = new Koa();
  koa.context.guidHeader = global.config && global.config.reqGuidHeader;
  const parsedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  koa
    .use(respond())
    .use(middleware.errorHandler)
    .use(middleware.httpLogger)
    .use(body({ parsedMethods }))
    .use(router())
    .use(middleware.notFound);

  const server = Http.createServer(koa.callback());
  server
    .on('listening', () => logger.info(`Server is listening ${global.config.port}`))
    .on('error', e => {
      logger.error(`Error while listening port ${global.config.port}`, { message: e.message }, stackTrace.get());
      process.exit(1);
    })
    .on('close', () => {
      if (global.dbClient && global.dbClient.close) {
        global.dbClient.close();
      }
      logger.debug('Server is closing, bye...');
    });

  logger.debug('Server created, ready to listen...');
  return server;
};
