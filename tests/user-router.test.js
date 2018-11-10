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

  it('should return 404 not found with a bad route', async () => {

    const response =
      await mockRequest.post('/signups')
        .send(newUserInfo);

    expect(response.status).toBe(404);
  });

  it('should signup a user with good credentials', async () => {

    const response =
      await mockRequest.post('/signup')
        .send(newUserInfo);

    expect(response.text.split('.').length).toBe(3);
    expect(response.status).toBe(200);
  });

  it('should NOT signup a user with BAD/incomplete credentials', async () => {

    const userInfo = { username: 'foo', email: 'foo@bar.com' };

    const response = await mockRequest.post('/signup').send(userInfo);

    expect(response.status).toBe(400);
    expect(response.res.statusMessage).toBe('Bad Request');


  });

  it('should allow a valid USER to sign in with Basic Auth.', async () => {

    const userInfo = { username: 'foo', email: 'foo@bar.com', password: 'foobar' };

    await mockRequest.post('/signup').send(userInfo);

    const response = await mockRequest.post('/signin').auth('foo', 'foobar');

    expect(response.text.split('.').length).toBe(3);
    expect(response.status).toBe(200);
  });

  it('should NOT allow an invalid USER to sign in with Basic Auth.', async () => {

    const userInfo = { username: 'foo', email: 'foo@bar.com', password: 'foobar' };

    await mockRequest.post('/signup').send(userInfo);

    const response = await mockRequest.post('/signin').auth('foobar', 'barfoo');

    expect(response.status).toBe(401);
    expect(response.res.statusMessage).toBe('Unauthorized');

  });

  it('should allow a VALID user to sign in with BEARER Auth.', async () => {

    const userInfo = { username: 'foo', email: 'foo@bar.com', password: 'foobar' };

    const signUpRes = await mockRequest.post('/signup').send(userInfo);

    console.log(signUpRes.text);

    const signInRes = await mockRequest.post('/signin').auth(signUpRes.text);

    console.log(signUpRes.text);

    expect(signInRes.text).toEqual(signUpRes.text);
    expect(signInRes.status).toBe(200);

  });
});



xit('should NOT allow an INVALID user to sign in with BEARER Auth.', async () => {

  const userInfo = { username: 'foo', email: 'foo@bar.com', password: 'foobar' };

  await mockRequest.post('/signup').send(userInfo);

  const response = await mockRequest.post('/signin').auth('foobar', 'barfoo');

  expect(response.status).toBe(401);
  expect(response.res.statusMessage).toBe('Unauthorized');

});

