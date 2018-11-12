import supergoose, { startDB, stopDB } from './supergoose.js';

import Books from '../src/api/books-model.js';
import Author from '../src/api/author-model';
import User from '../src/api/user-model.js';

const { app } = require('../src/server.js');
const mockRequest = supergoose(app);

const newBook = { title: 'test', genre: 'testing', author: 'TBD' };
const editBook = { title: 'newTest', genre: 'reTest', author: 'dunno' };

const userInfo = { username: 'foo', email: 'foo@bar.com', password: 'foobar', role: 'user' };

const editorInfo = { username: 'bar', email: 'bar@foo.com', password: 'barfoo', role: 'editor' };

const adminInfo = { username: 'admin', email: 'admin@foobar.com', password: 'adminfoobar', role: 'admin' };

// Hooks for Jest
beforeAll(startDB);
afterAll(stopDB);

afterEach(async () => {
  // Clear the documents after tests
  await Books.deleteMany({});
  await Author.deleteMany({});
  await User.deleteMany({});
});

describe('API SERVER', () => {

  it('should respond with a 404 on an invalid route', async () => {

    const response =
      await mockRequest.get('/invalidRoute');

    expect(response.status).toBe(404);

  });

  it('should respond with 404 - NOT FOUND for an invalid model', async () => {

    const signUpRes = await mockRequest.post('/signup').send(adminInfo);

    const badGetRoute =
      await mockRequest.get('/api/v1/badModel')
        .set('Authorization', `Bearer ${signUpRes.text}`);

    const badRoutewithId =
      await mockRequest.get('/api/v1/badModel/123456')
        .set('Authorization', `Bearer ${signUpRes.text}`);

    expect(badGetRoute.status).toBe(404);
    expect(badGetRoute.res.statusMessage).toBe('NOT FOUND');

    expect(badRoutewithId.status).toBe(404);
    expect(badRoutewithId.res.statusMessage).toBe('NOT FOUND');

  });

  it('should respond with a 200 on a get request to a valid model', async () => {

    const signUpRes = await mockRequest.post('/signup').send(userInfo);

    const goodRoute =
      await mockRequest.get('/api/v1/books')
        .set('Authorization', `Bearer ${signUpRes.text}`);

    expect(goodRoute.status).toBe(200);

  });

  it('should respond properly on a get request with a bad id', async () => {

    const signUpRes = await mockRequest
      .post('/signup').send(userInfo);

    const badId =
      await mockRequest
        .get('/api/v1/books/123456')
        .set('Authorization', `Bearer ${signUpRes.text}`);

    expect(badId.status).toBe(404);

  });

  it('should respond properly on a get request with a good id', async () => {

    const editor = await mockRequest
      .post('/signup').send(editorInfo);

    const signUpRes = await mockRequest
      .post('/signup').send(userInfo);

    const editorAcl = await mockRequest
      .post('/api/v1/books')
      .send(newBook)
      .set('Authorization', `Bearer ${editor.text}`);

    const bookDetails = JSON.parse(editorAcl.res.text);

    const goodId =
      await mockRequest
        .get(`/api/v1/books/${bookDetails._id}`)
        .set('Authorization', `Bearer ${signUpRes.text}`);

    expect(goodId.status).toBe(200);
    expect(goodId.body.title).toEqual(newBook.title);

  });

  it('should be able to post to /api/v1/books and return a 200', async () => {

    const signUpRes = await mockRequest
      .post('/signup').send(editorInfo);

    const editorAcl =
      await mockRequest.post('/api/v1/books')
        .send(newBook)
        .set('Authorization', `Bearer ${signUpRes.text}`);

    expect(editorAcl.status).toBe(200);
    expect(editorAcl.body.title).toEqual(newBook.title);

  });


  it('following multiple posts, should return the correct count', async () => {

    const editor = await mockRequest
      .post('/signup').send(editorInfo);

    await mockRequest
      .post('/api/v1/books')
      .send(newBook)
      .set('Authorization', `Bearer ${editor.text}`);

    await mockRequest
      .post('/api/v1/books')
      .send(editBook)
      .set('Authorization', `Bearer ${editor.text}`);

    const actual = await Books.where({}).count({});

    expect(actual).toBe(2);

  });

  it('a get should find zero records still', async () => {

    const actual = await Books.where({}).count();

    expect(actual).toBe(0);

  });

  it('should update a record with revised information andf return Status 200', async () => {

    const editor = await mockRequest
      .post('/signup').send(editorInfo);

    const originalBook = await mockRequest
      .post('/api/v1/books')
      .send(newBook)
      .set('Authorization', `Bearer ${editor.text}`);

    const bookDetails = JSON.parse(originalBook.res.text);

    const putResponse = await mockRequest
      .patch(`/api/v1/books/${bookDetails._id}`)
      .send({ title: 'PUT-TEST', author: 'TBD' })
      .set('Authorization', `Bearer ${editor.text}`);

    expect(putResponse.status).toBe(200);
    expect(putResponse.body.title).toBe('PUT-TEST');

  });

  it('should update a record with revised information andf return Status 200', async () => {

    const editor = await mockRequest
      .post('/signup').send(editorInfo);

    const originalBook = await mockRequest
      .post('/api/v1/books')
      .send(newBook)
      .set('Authorization', `Bearer ${editor.text}`);

    const bookDetails = JSON.parse(originalBook.res.text);

    const putResponse = await mockRequest
      .put(`/api/v1/books/${bookDetails._id}`)
      .send({ title: 'PUT-TEST', author: 'TBD' })
      .set('Authorization', `Bearer ${editor.text}`);

    expect(putResponse.status).toBe(200);
    expect(putResponse.body.title).toBe('PUT-TEST');

  });

  it('should delete a single record', async () => {

    const admin = await mockRequest
      .post('/signup').send(adminInfo);

    const originalBook = await mockRequest
      .post('/api/v1/books')
      .send(newBook)
      .set('Authorization', `Bearer ${admin.text}`);

    const bookDetails = JSON.parse(originalBook.res.text);

    const completed = await mockRequest
      .delete(`/api/v1/books/${bookDetails._id}`)
      .set('Authorization', `Bearer ${admin.text}`);

    const actual = JSON.parse(completed.res.text);

    expect(actual.deleteRequest).toEqual('completed');

  });

  it('should prevent unauthorized access', async () => {

    const user = await mockRequest
      .post('/signup').send(userInfo);

    const admin = await mockRequest
      .post('/signup').send(adminInfo);

    const originalBook = await mockRequest
      .post('/api/v1/books')
      .send(newBook)
      .set('Authorization', `Bearer ${admin.text}`);

    const bookDetails = JSON.parse(originalBook.res.text);

    const badPost = await mockRequest
      .post(`/api/v1/books`)
      .send(newBook)
      .set('Authorization', `Bearer ${user.text}`);

    const badPut = await mockRequest
      .put(`/api/v1/books/${bookDetails._id}`)
      .set('Authorization', `Bearer ${user.text}`);

    const badDelete = await mockRequest
      .delete(`/api/v1/books/${bookDetails._id}`)
      .set('Authorization', `Bearer ${user.text}`);

    expect(badPost.res.statusMessage).toBe('Unauthorized');
    expect(badPut.res.statusMessage).toBe('Unauthorized');
    expect(badDelete.res.statusMessage).toBe('Unauthorized');

  });

});