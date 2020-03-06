const { errorHandler } = require('../../../dist/core/middlewares').default;

test('Error Handler#Reject', async () => {
  const checkSend = {};
  const ctx = {
    send: (status, response) => {
      checkSend['status'] = status;
      checkSend['response'] = response;
    }
  };
  const message = 'Test error';
  const promise = () =>
    new Promise((resolve, rejected) => {
      rejected({ message });
    });

  await errorHandler(ctx, promise);
  expect(typeof errorHandler).toBe('function');
  expect(checkSend['status']).toBe(500);
  expect(checkSend['response']).toBeDefined();
  expect(checkSend['response'].errors).toBeDefined();
  expect(checkSend['response'].errors[0].status).toBe(500);
  expect(checkSend['response'].errors[0].detail).toBe(message);
});

test('Error Handler#Resolve', async () => {
  const checkSend = {};
  const ctx = {
    send: (status, response) => {
      checkSend['status'] = status;
      checkSend['response'] = response;
    }
  };
  const promise = () =>
    new Promise((resolve, rejected) => {
      resolve();
    });

  await errorHandler(ctx, promise);
  expect(typeof errorHandler).toBe('function');
  expect(checkSend['status']).toBeUndefined();
  expect(checkSend['response']).toBeUndefined();
});
