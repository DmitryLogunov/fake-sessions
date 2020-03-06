const filteringFunc = require('../../../../dist/core/controllers/helpers/filter-helper');
const parseFilter = filteringFunc.default;

test('Filtering#default', () => {
  const params = {
    'filter[val]': 1
  };
  const filter = parseFilter(params);

  expect(filter.val).toBeDefined();
  expect(filter.val[0]).toBeDefined();
  expect(filter.val[1]).toBeDefined();
  expect(filter.val[0]).toBe(1);
  expect(filter.val[1]).toBe('eq');
});

test('Filtering#false', () => {
  const params = {
    'filtr[val]': 1
  };
  const filter = parseFilter(params);

  expect(filter).toBe(false);
});

test('Filtering#operands', () => {
  const params = {
    'filter[one][eq]': 1,
    'filter[two][ne]': 2,
    'filter[three][gt]': 3,
    'filter[four][gte]': 4,
    'filter[five][lte]': 5,
    'filter[six][lt]': 6
  };
  const filter = parseFilter(params);

  expect(filter.one).toBeDefined();
  expect(filter.two).toBeDefined();
  expect(filter.three).toBeDefined();
  expect(filter.four).toBeDefined();
  expect(filter.five).toBeDefined();
  expect(filter.six).toBeDefined();

  expect(filter.one[1]).toBe('eq');
  expect(filter.two[1]).toBe('ne');
  expect(filter.three[1]).toBe('gt');
  expect(filter.four[1]).toBe('gte');
  expect(filter.five[1]).toBe('lte');
  expect(filter.six[1]).toBe('lt');
});
