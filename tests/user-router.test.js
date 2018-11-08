import supergoose, { startDB, stopDB } from './supergoose.js';

import { app } from '../src/server.js';

import User from '../src/api/user-model.js';

const mockRequest = supergoose(app);

const newUserInfo = { username: 'foo', email: 'foo@bar.com', password: 'foobar' };

// Hooks for Jest
beforeAll(startDB);
afterAll(stopDB);

afterEach(async () => {
  // Clear the documents after tests
  await User.deleteMany({});
});

describe('Test the API', () => {

  xit('should return 404 not found with a bad route', async () => {

    const response =
      await mockRequest.post('/signups')
        .send(newUserInfo);

    expect(response.status).toBe(404);
  });

  xit('should signup a user with good credentials', async () => {

    const response =
      await mockRequest.post('/signup')
        .send(newUserInfo);

    expect(response.text.split('.').length).toBe(3);
    expect(response.status).toBe(200);
  });

  xit('should NOT signup a user with BAD/incomplete credentials', async () => {

    const userInfo = { username: 'foo', email: 'foo@bar.com' };

    const response = await mockRequest.post('/signup').send(userInfo);

    expect(response.status).toBe(400);


  });

  xit('should allow a valid USER to sign in.', async () => {

    const userInfo = { username: 'foo', email: 'foo@bar.com', password: 'foobar' };

    await mockRequest.post('/signup').send(userInfo);

    const response = await mockRequest.get('/signin').auth('foo', 'foobar');

    expect(response.text.split('.').length).toBe(3);
    expect(response.status).toBe(200);
  });

  xit('should NOT allow an invalid USER to sign in.', async () => {

    const userInfo = { username: 'foo', email: 'foo@bar.com', password: 'foobar' };

    await mockRequest.post('/signup').send(userInfo);

    const response = await mockRequest.get('/signin').auth('foobar', 'barfoo');

    expect(response.status).toBe(401);

    expect(response.res.statusMessage).toBe('Unauthorized');

  });

});