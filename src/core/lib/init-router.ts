import { Middleware } from 'koa';
import compose, { ComposedMiddleware } from 'koa-compose';
import Router from 'koa-router';

import { IResource, IResourcesSettings } from '../types/config';

/**
 * Returns ComposedMiddleware object for feeding it to Koa server
 */
const buildComposedMiddleware = (
  resources: IResource[],
  resourcesSettings: IResourcesSettings,
  additionalRouters?: Router[]
): ComposedMiddleware<any> => {
  const middlewares: Middleware[] = [];

  for (const resource of resources) {
    const router: Router = new Router();
    router.prefix(`/${resource.prefix}`);

    const tables = resource.tables;  
    const model = new resourcesSettings[resource.name].model(tables);
    const controller = new resourcesSettings[resource.name].controller(resource.prefix, model);

    for (const method of resource.methods) {
      switch (method) {
        case 'GET':
          router.get('/', ctx => controller.getByParams(ctx));
          router.get('/:id', ctx => controller.getOne(ctx));
          break;
        case 'POST':
          router.post('/', ctx => controller.create(ctx));
          break;
        case 'PUT':
          router.put('/:id', ctx => controller.update(ctx));
          break;
        case 'PATCH':
          router.patch('/:id', ctx => controller.patch(ctx));
          break;
        case 'DELETE':
          router.delete('/:id', ctx => controller.delete(ctx));
      }
    }

    middlewares.push(router.routes());
    if (router.allowedMethods) {
      middlewares.push(router.allowedMethods());
    }
  }

  if (additionalRouters) {
    for (const additionaRouter of additionalRouters) {
      middlewares.push(additionaRouter.routes());
      if (additionaRouter.allowedMethods) {
        middlewares.push(additionaRouter.allowedMethods());
      }
    }
  }

  return compose(middlewares);
};

export default (resources: IResource[], resourcesSettings: IResourcesSettings, additionalRouters?: Router[]) => {
  return () => {
    return buildComposedMiddleware(resources, resourcesSettings, additionalRouters);
  };
};
