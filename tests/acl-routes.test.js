import supergoose, { startDB, stopDB } from './supergoose.js';

import Books from '../src/api/books-model.js';
import Author from '../src/api/author-model';
import User from '../src/api/user-model.js';

const { app } = require('../src/server.js');
const mockRequest = supergoose(app);

const url = '/api/v1/books';
const newBook = { title: 'test', genre: 'testing', author: 'TBD' };

const userInfo = { username: 'foo', email: 'foo@bar.com', password: 'foobar' };

const editorInfo = { username: 'foo', email: 'foo@bar.com', password: 'foobar', user: 'editor' };

const adminInfo = { username: 'foo', email: 'foo@bar.com', password: 'foobar', user: 'admin' };

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

    const signUpRes = await mockRequest.post('/signup').send(userInfo);

    const badRoute =
      await mockRequest.get('/api/v1/badModel')
        .set('Authorization', `Bearer ${signUpRes.text}`);

    const badRoutewithId =
      await mockRequest.get('/api/v1/badModel/123456')
        .set('Authorization', `Bearer ${signUpRes.text}`);

    expect(badRoute.status).toBe(404);
    expect(badRoute.res.statusMessage).toBe('NOT FOUND');

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

    const signUpRes = await mockRequest.post('/signup').send(userInfo);

    const badId =
      await mockRequest.get('/api/v1/books/123456')
        .set('Authorization', `Bearer ${signUpRes.text}`);

    expect(badId.status).toBe(404);

  });

  xit('should respond properly on a get request with a good id', async () => {

    const signUpRes = await mockRequest.post('/signup').send(userInfo);

    const addBook =
      await mockRequest.post('/api/v1/books/123456')
        .set('Authorization', `Bearer ${signUpRes.text}`)
        .send;

    expect(badId.status).toBe(404);

  });

  it('should be able to post to /api/v1/books and retrun a 200', async () => {

    const signUpRes = await mockRequest.post('/signup').send(editorInfo);

    const editorAcl =
      await mockRequest.post('/api/v1/books')
        .send(newBook)
        .set('Authorization', `Bearer ${signUpRes.text}`);
    expect.(editorAcl.res.statusMessage).toBe('');
    expect(editorAcl.status).toBe(404);

    expect(response.status).toBe(200);
    expect(response.body.title).toEqual(newBook.title);

  });

  xit('following a post, should find a single record', async () => {

    const postResponse = await mockRequest.post(url).send(newBook);

    const bookId = postResponse.body._id;

    const getResponse = await mockRequest.get(`/api/v1/books/${bookId}`);

    const book = getResponse.body;

    expect(book.title).toEqual(newBook.title);

  });

  xit('following multiple posts, should return the correct count', async () => {

    const obj = { title: 'test', text: 'foo' };

    await mockRequest.post('/api/v1/books').send(obj);

    await mockRequest.post('/api/v1/books').send(obj);

    const actual = await Books.where({}).count({});

    expect(actual).toBe(2);

  });

  xit('a get should find zero records still', async () => {

    const actual = await Books.where({}).count();

    expect(actual).toBe(0);

  });

  xit('should update a record with revised information andf return Status 200', async () => {

    const postResponse = await mockRequest.post(url).send(newBook);

    const bookId = postResponse.body._id;

    const putResponse =
      await mockRequest
        .put(`/api/v1/books/${bookId}`)
        .send({ title: 'PUT-TEST' });

    const updatedBook = putResponse.body;
    expect(updatedBook.title).toEqual('PUT-TEST');
    expect(putResponse.status).toBe(200);
  });

  xit('should delete a single record', async () => {

    const postResponse = await mockRequest.post(url).send(newBook);

    const bookId = postResponse.body._id;

    await mockRequest.delete(`/api/v1/books/${bookId}`);

    const isItThere = await mockRequest.delete(`/api/v1/books/${bookId}`);

    expect(isItThere.body).toBeNull();

  });

});