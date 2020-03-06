import initConfig from './core/lib/init-config';
global.config = initConfig('config.yaml');

import initDB from './core/lib/init-db';
global.dbClient = initDB(global.config.dbSettings);

global.cache = [];

import initRouter from './core/lib/init-router';
import initServer from './core/lib/init-server';

import { IResourcesSettings } from './core/types/config';

import { SessionsController } from './controllers';
import { SessionsModel } from './models';

const resourcesSettings: IResourcesSettings = {
  sessions: {
    controller: SessionsController,
    model: SessionsModel
  }
};

if (!module.parent) {
  const router = initRouter(global.config.resources, resourcesSettings);
  const server = initServer(router);
  server.listen(global.config.port);
}
