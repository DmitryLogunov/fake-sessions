import isNumber from 'is-number';
import { Context } from 'koa';
import { get } from 'lodash';
import stackTrace from 'stack-trace';
import { logger } from '../lib';
import { IBaseController } from '../types/controller';
import { IKeyValue } from './../types/helpers';
import { IBaseModel } from './../types/model';
import DataHelper from './helpers/data-helper';
import parseFilter from './helpers/filter-helper';
import getPaginationLinks from './helpers/pagination-helper';

const { defaultLimit } = global.config;

export default class BaseController implements IBaseController {
  protected model: IBaseModel;
  protected limit: number;
  protected dataHelper: DataHelper;
  protected resource: string;
  protected errors: IKeyValue;

  constructor(resource: string, limit?: number) {
    if (!resource) {
      logger.error(`The resource isn't defined! It's not possible to create the controller.`, null, stackTrace.get());
      return;
    }
    this.resource = resource;
    this.limit = limit || defaultLimit;
    this.errors = {
      1: 'An error occurred while requesting to the database',
      2: 'Id must be a number',
      3: 'Invalid data',
      4: 'Resource not found'
    };
  }

  /**
   * Makes a selection of parameters (optional)
   *
   * @param ctx
   */
  public async getByParams(ctx: Context): Promise<void> {
    const { 'page[number]': pageNum, 'page[size]': pageSize, ...params } = ctx.query;
    const page = pageNum && isNumber(pageNum) ? pageNum - 1 : 0;

    this.limit = pageSize && isNumber(pageSize) ? pageSize : defaultLimit;
    this.model.setLimit(this.limit);

    const clientFilter = parseFilter({ ...params });
    if (!clientFilter) {
      const detail = this.errors[3];
      const message = this.dataHelper.errorResponse({ detail, status: 400 });
      return ctx.badRequest(message);
    }

    const filter = this.dataHelper.transformRelationFilter(clientFilter);
    const [documentuments, dataCountTable] = await Promise.all([
      this.model.getByParams(filter, page),
      this.model.getCountOfTable(filter)
    ]);

    if (!documentuments.status) {
      const detail = documentuments.message || this.errors[1];
      const message = this.dataHelper.errorResponse({ detail, status: 400 });
      return ctx.badRequest(message);
    }

    if (!dataCountTable.status) {
      const detail = dataCountTable.message || this.errors[1];
      const message = this.dataHelper.errorResponse({ detail, status: 400 });
      return ctx.badRequest(message);
    }

    const count = dataCountTable.data[0].count;
    const links = getPaginationLinks(page, this.limit, count, {
      ...ctx.query
    });

    const response = this.dataHelper.specificationResponse(documentuments.data);
    ctx.ok({ links, data: response });
  }

  /**
   * Makes a selection one row
   *
   * @param ctx
   */
  public async getOne(ctx: Context): Promise<void> {
    const { id } = ctx.params;
    const { field } = ctx.query;

    if (!isNumber(id)) {
      const detail = this.errors[2];
      const message = this.dataHelper.errorResponse({ detail, status: 400 });
      return ctx.badRequest(message);
    }

    const document = await this.model.getRowByField(id, field);

    if (!document.status) {
      const detail = document.message || this.errors[1];
      const message = this.dataHelper.errorResponse({ detail, status: 400 });
      return ctx.badRequest(message);
    }

    if (document.data && !document.data.length) {
      const message = this.dataHelper.errorResponse({
        detail: this.errors[4],
        status: 404
      });
      return ctx.notFound(message);
    }

    const response = this.dataHelper.specificationResponse(document.data);
    ctx.ok({ data: response });
  }

  /**
   * Create new row
   *
   * @param ctx
   */
  public async create(ctx: Context): Promise<void> {
    const payload = this.dataHelper.parseBody(ctx.request.body);
    const row = await this.model.create(payload);

    if (!row.status) {
      const detail = row.message || this.errors[1];
      const message = this.dataHelper.errorResponse({ detail, status: 400 });
      return ctx.badRequest(message);
    }

    const id = get(row, 'data.insertId');
    const response = this.dataHelper.specificationResponse([{ id }]);
    ctx.created({ data: response });
  }

  /**
   * Updates the selected row
   *
   * @param ctx
   */
  public async update(ctx: Context): Promise<void> {
    const { id } = ctx.params;
    const { field = 'id' } = ctx.query;

    if (!isNumber(id)) {
      const detail = this.errors[2];
      const message = this.dataHelper.errorResponse({ detail, status: 400 });
      return ctx.badRequest(message);
    }

    const params = { [field]: id };
    const payload = this.dataHelper.parseBody(ctx.request.body);
    const isUpdated = await this.model.update(payload, params);

    if (!isUpdated.status) {
      const detail = isUpdated.message || this.errors[1];
      const message = this.dataHelper.errorResponse({ status: 400, detail });
      return ctx.badRequest(message);
    }

    const affectedRows = get(isUpdated, 'data.affectedRows');
    if (!affectedRows) {
      const detail = this.errors[4];
      const message = this.dataHelper.errorResponse({ detail, status: 404 });
      return ctx.notFound(message);
    }

    const changedRows = get(isUpdated, 'data.changedRows');
    if (!changedRows) {
      return ctx.noContent();
    }

    const response = this.dataHelper.specificationResponse([{ id }]);
    ctx.send(203, { data: response });
  }

  /**
   * Patch a selection row
   * @param ctx
   */
  public async patch(ctx: Context): Promise<void> {
    const message = this.dataHelper.errorResponse({ detail: 'Methos Not Allowed', status: 405 });
    ctx.send(405, message);
  }

  /**
   * Delete a selection row
   *
   * @param ctx
   */
  public async delete(ctx: Context): Promise<void> {
    const { id } = ctx.params;
    const { field = 'id' } = ctx.query;

    if (!isNumber(id)) {
      const detail = this.errors[2];
      const message = this.dataHelper.errorResponse({ detail, status: 400 });
      return ctx.badRequest(message);
    }

    const params = { [field]: id };
    const isDeleted = await this.model.delete(params);

    if (!isDeleted.status) {
      const detail = isDeleted.message || this.errors[1];
      const message = this.dataHelper.errorResponse({ detail, status: 400 });
      return ctx.badRequest(message);
    }

    const affectedRows = get(isDeleted, 'data.affectedRows');
    if (affectedRows) {
      return ctx.noContent();
    } else {
      const detail = this.errors[4];
      const message = this.dataHelper.errorResponse({ detail, status: 404 });
      ctx.notFound(message);
    }
  }
}
