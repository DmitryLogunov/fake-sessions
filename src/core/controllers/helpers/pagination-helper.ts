import qs from 'querystring';
import { IKeyValue, IPaginationLinks } from './../../types/helpers';

/**
 * Makes object links for pagination by specification <Json:Api>
 *
 * @param {number} page
 * @param {number} limit
 * @param {number} count
 * @param {IKeyValue} query
 *
 * @returns {IPaginationLinks}
 */
export default function getPaginationLinks(
  page: number,
  limit: number,
  count: number,
  query?: IKeyValue
): IPaginationLinks {
  const lastPage = Math.ceil(count / limit);

  const self = getStingLinks(page + 1, limit, query);
  const first = getStingLinks(1, limit, query);
  const prev = page < lastPage && page > 0 ? getStingLinks(page, limit, query) : undefined;
  const next = page + 2 <= lastPage ? getStingLinks(page + 2, limit, query) : undefined;
  const last = getStingLinks(lastPage, limit, query);

  return { self, first, prev, next, last };
}

/**
 * Makes one link
 *
 * @param {number} page
 * @param {number} limit
 * @param {IKeyValue} query
 *
 * @returns {string}
 */
function getStingLinks(page: number, limit: number, query?: IKeyValue): string {
  query['page[number]'] = String(page);
  query['page[size]'] = String(limit);

  const queryString: string = qs.stringify(query);
  const unescapeQueryString = '/?' + qs.unescape(queryString);

  return unescapeQueryString;
}
