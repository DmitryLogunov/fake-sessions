'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const koa_compose_1 = __importDefault(require('koa-compose'));
const koa_router_1 = __importDefault(require('koa-router'));
const index_1 = require('./controllers');
const { resource } = global.config;
exports.default = () => {
  const router = new koa_router_1.default();
  router.prefix(`/${resource}`);
  router.get('/', index_1.testResourceController.getByParams.bind(index_1.testResourceController));
  router.get('/:id', index_1.testResourceController.getOne.bind(index_1.testResourceController));
  router.post('/', index_1.testResourceController.create.bind(index_1.testResourceController));
  router.delete('/:id', index_1.testResourceController.delete.bind(index_1.testResourceController));
  router.put('/:id', index_1.testResourceController.update.bind(index_1.testResourceController));
  const middlewares = [];
  middlewares.push(router.routes());
  if (router.allowedMethods) middlewares.push(router.allowedMethods());
  return koa_compose_1.default(middlewares);
};
