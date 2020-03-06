'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const test_resource_model_1 = __importDefault(require('../models/test-resource-model'));

const path_1 = __importDefault(require('path'));
const baseControllerPath = path_1.default.resolve(__dirname + '../../../../../../dist/core/controllers/base-controller');
const base_contoller_1 = __importDefault(require(baseControllerPath));
const dataHelperPath = path_1.default.resolve(__dirname + '../../../../../../dist/core/controllers/helpers/data-helper');
const data_helper_1 = __importDefault(require(dataHelperPath));

const { resource } = global.config;
class TestResourceController extends base_contoller_1.default {
  constructor(limit) {
    super(resource, limit);
    this.model = new test_resource_model_1.default(null, limit);
    this.dataHelper = new data_helper_1.default(resource, this.model.getSchema());
  }
}
exports.default = TestResourceController;
