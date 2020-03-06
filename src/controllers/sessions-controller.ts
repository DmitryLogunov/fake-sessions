import isNumber from 'is-number';
import { Context } from 'koa';
import { find, remove } from 'lodash';
import BaseController from '../core/controllers/base-controller';
import DataHelper from '../core/controllers/helpers/data-helper';
import getPaginationLinks from '../core/controllers/helpers/pagination-helper';
import { IUser } from '../core/types/config';
import { IBaseController } from '../core/types/controller';
import { IBaseModel } from '../core/types/model';


const { defaultLimit, version } = global.config;

export default class SessionsController extends BaseController implements IBaseController {
  constructor(resource: string, model: IBaseModel, limit?: number) {
    super(resource, limit);
    this.model = model;
    this.dataHelper = new DataHelper(resource, this.model.getSchema());
  }

  /**
   * Makes a selection of parameters (optional)
   *
   * @param ctx
   */
  public async getByParams(ctx: Context): Promise<void> {
    const detail = 'Not found';
    const message = this.dataHelper.errorResponse({ detail, status: 404 });
    ctx.notFound(message);
  }

  /**
   * Makes a selection one row
   *
   * @param ctx
   */
  public async getOne(ctx: Context): Promise<void> {
    const { id } = ctx.params;
    
    const wantedSession: IUser = find(global.cache, (session: any) => {
      return session.id === id;
    });

    if(!wantedSession) {
      const detail = 'Unauthorized';
      const message = this.dataHelper.errorResponse({ detail, status: 401 });
      return ctx.unauthorized(message);
    }

    const response = this.dataHelper.specificationResponse([wantedSession])[0];
    response.relationships = {organizations: {data: {id: 1}}};
    const meta = { version }; 

    ctx.ok({ meta, data: response });  
  }

  /**
   * Create new row
   *
   * @param ctx
   */
  public async create(ctx: Context): Promise<void> {
    const { user, password } = this.dataHelper.parseBody(ctx.request.body);
    const userToAuthenticate: IUser = { username: user, password };

    const { users } = global.config;
    
    const findAuthenticatedUser = find(users, (u: IUser) => { 
        return u.username === userToAuthenticate.username && u.password === unescape(userToAuthenticate.password); 
      } );

    if(!findAuthenticatedUser) {
      const detail = 'Unauthorized';
      const message = this.dataHelper.errorResponse({ detail, status: 401 });
      return ctx.unauthorized(message);
    }
 
    const sessionID =  (Buffer.from(this.randomString(100))).toString();
    global.cache.push({id: sessionID, login: user });    

    const response = this.dataHelper.specificationResponse([{id: sessionID, login: user }])[0];
    response.relationships = {organizations: {data: {id: 1}}};
    const meta = { version }; 

    ctx.created({ meta, data: response });

  }

  /**
   * Delete a selection row
   *
   * @param ctx
   */
  public async delete(ctx: Context): Promise<void> {
    const { id } = ctx.params;

    const wantedSession: IUser = find(global.cache, (session: any) => {
      return session.id === id;
    });

    if(!wantedSession) {
      const detail = 'Not found';
      const message = this.dataHelper.errorResponse({ detail, status: 404 });
      return ctx.notFound(message);     
    }

    remove(global.cache, (session: any) => {
      return session.id === id;
    });

    return ctx.noContent();
  }

  /**
   * Returns random string
   */
  private randomString(length: number): string {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
}
