import supergoose, { startDB, stopDB } from './supergoose.js';
import Books from '../src/api/books-model.js';

const { server } = require('../src/server.js');
const mockRequest = supergoose(server);

const url = '/api/v1/books';
const newBook = { title: 'test', genre: 'testing', author: 'TBD' };

// Hooks for Jest
beforeAll(startDB);
afterAll(stopDB);
afterEach(async () => {
  // Clear the documents after tests
  await Books.deleteMany({});
});

describe('API SERVER', () => {

  it('should respond with a 404 on an invalid route', async () => {

    const response =
      await mockRequest.get('/invalidRoute');

    expect(response.status).toBe(404);

  });

  // FIXME:
  xit('should respond with model not found for an invalid model', async () => {

    const getResponse =
      await mockRequest.get('/api/v1/badModel');

    console.log(getResponse.res);

    expect(getResponse.res).toEqual();

  });



  it('should respond with a 200 on a get request to a valid model', async () => {

    const response = await mockRequest.get(url);

    expect(response.status).toBe(200);

  });

  // FIXME: FIGURE OUT WHY 500 RETURNS HERE 
  it('should respond properly on a get request with a bad id', async () => {

    const response = await mockRequest.get('/api/v1/badchoice');

    expect(response.status).toBe(400);

  });

  it('should be able to post to /api/v1/books and retrun a 200', async () => {

    const response =
      await mockRequest
        .post(url)
        .send(newBook);

    expect(response.status).toBe(200);
    expect(response.body.title).toEqual(newBook.title);

  });

  it('following a post, should find a single record', async () => {

    const postResponse = await mockRequest.post(url).send(newBook);

    const bookId = postResponse.body._id;

    const getResponse = await mockRequest.get(`/api/v1/books/${bookId}`);

    const book = getResponse.body;

    expect(book.title).toEqual(newBook.title);

  });

  it('following multiple posts, should return the correct count', async () => {

    const obj = { title: 'test', text: 'foo' };

    await mockRequest.post('/api/v1/books').send(obj);

    await mockRequest.post('/api/v1/books').send(obj);

    const actual = await Books.where({}).count({});

    expect(actual).toBe(2);

  });

  it('a get should find zero records still', async () => {

    const actual = await Books.where({}).count();

    expect(actual).toBe(0);

  });

  it('should update a record with revised information andf return Status 200', async () => {

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

  it('should delete a single record', async () => {

    const postResponse = await mockRequest.post(url).send(newBook);

    const bookId = postResponse.body._id;

    await mockRequest.delete(`/api/v1/books/${bookId}`);

    const isItThere = await mockRequest.delete(`/api/v1/books/${bookId}`);

    expect(isItThere.body).toBeNull();

  });

});