const paginationFunc = require('../../../../dist/core/controllers/helpers/pagination-helper');
const getPaginationLinks = paginationFunc.default;

test('Pagionation Links#all links', () => {
  const page = 3;
  const limit = 15;
  const count = 123;
  const links = getPaginationLinks(page, limit, count, {});

  expect(links.self).toBeDefined();
  expect(links.first).toBeDefined();
  expect(links.prev).toBeDefined();
  expect(links.next).toBeDefined();
  expect(links.last).toBeDefined();
});

test('Pagionation Links#without NEXT', () => {
  const page = 8;
  const limit = 15;
  const count = 123;
  const links = getPaginationLinks(page, limit, count, {});

  expect(links.self).toBeDefined();
  expect(links.first).toBeDefined();
  expect(links.prev).toBeDefined();
  expect(links.last).toBeDefined();
  expect(links.self).toBe(links.last);
});

test('Pagionation Links#without PREV', () => {
  const page = 0;
  const limit = 15;
  const count = 123;
  const links = getPaginationLinks(page, limit, count, {});

  expect(links.self).toBeDefined();
  expect(links.first).toBeDefined();
  expect(links.next).toBeDefined();
  expect(links.last).toBeDefined();
  expect(links.self).toBe(links.first);
});
