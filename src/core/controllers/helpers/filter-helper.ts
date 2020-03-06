import { IFilterWithOperands, IKeyValue } from './../../types/helpers';
const operands = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'];

/**
 * Parsing querystring
 *
 * @param {IKeyValue} params - ctx.query Object
 * @returns {Object}
 */

export default function(params: IKeyValue): IFilterWithOperands | boolean {
  const filter: IFilterWithOperands = {};
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      try {
        const trimKeys = key.match(/^filter\[(.+?)\](\[(.+?)\])?/);
        if (trimKeys[2] && !operands.includes(trimKeys[3])) {
          return false;
        }
        const partKeys = [trimKeys[1], trimKeys[3]];
        filter[partKeys[0]] = [params[key], trimKeys[3] || 'eq'];
      } catch (e) {
        return false;
      }
    }
  }
  return filter;
}
