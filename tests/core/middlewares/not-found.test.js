const { notFound } = require('../../../dist/core/middlewares').default;

test('Not Found Middleware', async () => {
  const errors = {};
  const ctx = {
    request: {
      method: 'GET',
      path: '/test'
    },
    notFound: error => {
      errors['status'] = error.errors[0].status;
      errors['detail'] = error.errors[0].detail;
    }
  };

  await notFound(ctx);
  expect(errors.status).toBeDefined();
  expect(errors.status).toBe(404);
  expect(errors.detail).toBeDefined();
  expect(errors.detail).toMatch(/GET \/test/);
});
