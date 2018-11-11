import { startDB, stopDB } from './supergoose.js';
import Books from '../src/api/books-model';
import Authors from '../src/api/author-model.js';


// Hooks for Jest
beforeAll(startDB);
afterAll(stopDB);
afterEach(async () => {
  // Clear the documents after tests
  await Books.deleteMany({});
});

describe('Test to verify data models', () => {

  it('should create a new book', async () => {
    const bookInfo = { title: 'Pride and Prejudice', genre: 'Romance' };

    const book = await Books.create(bookInfo);

    expect(book.title).toBe(bookInfo.title);
  });

  it('should create a new author', async () => {
    const authorInfo = { title: 'Pride and Prejudice', genre: 'Romance' };

    const author = await Authors.create(authorInfo);

    expect(author.name).toBe(authorInfo.name);
  });

  it('should create a new model of books that links to an author', async () => {

    const authorInfo = { name: 'Charles Dickens' };
    const author = await Authors.create(authorInfo);

    const bookInfo = { title: 'A Christmas Carol', genre: 'Classics', author: author._id };
    const { _id } = await Books.create(bookInfo);

    const book = await Books.findById({ _id }).populate('author');

    expect(book.title).toBe(bookInfo.title);
    expect(book.author.name).toBe(authorInfo.name);

    const books = await Books.find({ author: author._id });
    expect(books.length).toBe(1);

  });

});