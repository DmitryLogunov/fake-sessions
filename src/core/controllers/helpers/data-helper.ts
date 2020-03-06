import { findKey, get } from 'lodash';
import { IDataJsonApi, IJsonApi, IKeyValue } from '../../types/helpers';
export default class DataHelper {
  private schema: any;
  private resource: string;

  constructor(resource: string, schema: any) {
    this.resource = resource;
    this.schema = schema;
  }

  /**
   * Performs object transformation from <Json:Api> to <key:value> Object
   *
   * @param data - ctx.request.body
   * @returns {IKeyValue}
   */
  public parseBody(data: IDataJsonApi): IKeyValue {
    if (this.resource !== get(data, 'data.type')) {
      const error: any = new Error('Unknown Resource Type');
      error.statusCode = 400;
      throw error;
    }

    const attributes = get(data, 'data.attributes');
    const relationships = get(data, 'data.relationships');
    const body = { ...attributes };

    for (const key in relationships) {
      if (relationships.hasOwnProperty(key)) {
        const dbKey = findKey(this.schema.relationships, { resource: key });
        const offset = get(this.schema, `relationships.${dbKey}.offset`);
        const id = get(relationships, `${key}.data.id`);
        if (id) {
          body[dbKey] = id - offset && id - offset > 0 ? id - offset : id;
        }
      }
    }

    return body;
  }

  /**
   * Formats an array objects in JSON:API
   *
   * @param data
   * @returns {IJsonApi[]}
   */
  public specificationResponse(data: any[]): IJsonApi[] {
    if (!data.length) {
      return [];
    }
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(item => this.objectToJsonApi(item));
  }

  /**
   * Makes an error Object
   *
   * @param errors
   * @returns {errors: any[]}
   */
  public errorResponse(errors: any): { errors: any[] } {
    const resError: any = { errors: [] };
    const errorOptions: any = {};

    if (errors.id) {
      errorOptions.id = errors.id;
    }
    if (errors.status) {
      errorOptions.status = errors.status;
    }
    if (errors.code) {
      errorOptions.code = errors.code;
    }
    if (errors.title) {
      errorOptions.title = errors.title;
    }
    if (errors.detail) {
      errorOptions.detail = errors.detail;
    }

    if (errors.source) {
      errorOptions.source = {};
      if (errors.source.pointer) {
        errorOptions.source.pointer = errors.source.pointer;
      }
      if (errors.source.parameter) {
        errorOptions.source.parameter = errors.source.parameter;
      }
    }

    if (errors.links) {
      errorOptions.links = { about: errors.links.about };
    }
    if (errors.meta) {
      errorOptions.meta = errors.meta;
    }

    resError.errors.push(errorOptions);

    return resError;
  }

  /**
   * Transform relationships filter resource.id => resource_id
   *
   * @param params
   * @returns {Object}
   */
  public transformRelationFilter(params: any): any {
    if (!this.schema.filter) {
      return params;
    }

    const newParams: any = {};
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const newKey = this.schema.filter[key] || key;
        newParams[newKey] = params[key];
      }
    }
    return newParams;
  }

  /**
   * Format an object in JSON:API
   *
   * @param object
   * @returns {IJsonApi}
   */
  private objectToJsonApi(object: IKeyValue): IJsonApi {
    const id: string = String(object.id || null);
    const attributes: any = {};
    const relationships: any = {};

    for (const key in object) {
      if (key === 'id') {
        continue;
      }

      if (this.schema.attributes && this.schema.attributes.includes(key)) {
        attributes[key] = String(object[key]);
        continue;
      }

      if (this.schema.relationships && this.schema.relationships[key]) {
        let type;
        const relData = this.schema.relationships[key];

        if (relData.type && relData.type[0] === '#') {
          type = object[relData.type.slice(1)] || relData.type.slice(1);
        } else {
          type = relData.type;
        }

        const relId = relData.pageCount ? object[key] + relData.pageCount : object[key];
        relationships[relData.resource] = {
          data: { type, id: String(relId) }
        };
        continue;
      }
    }

    const responseObject: IJsonApi = { id, type: this.resource };
    if (Object.keys(attributes).length) {
      responseObject.attributes = { ...attributes };
    }
    if (Object.keys(relationships).length) {
      responseObject.relationships = { ...relationships };
    }

    return responseObject;
  }
}
