// Load express and Router
import express from 'express';
const router = express.Router();

//Load data models
import User from './user-model.js';
import Book from './books-model.js';
import Author from './author-model.js';

//load local middleware
import auth from '../middleware/auth.js';
import sendJSON from '../middleware/sendJSON.js';

//setup the API "dictionary"
const models = {
  'books': Book,
  'author': Author,
};


// TODO: Revist this - the best way to process this would actually be with a res.redirect and a cookie.
router.post('/signup', (req, res, next) => {

  let user = new User(req.body);
  user.save()
    .then((user) => {
      req.token = user.generateToken();
      req.user = user;
      res.send(req.token);
    }).catch(error => {
      const err = { status: 400, statusMessage: 'Bad Request' };
      next(err);
    });
});

router.post('/signin', auth(), (req, res) => {
  res.send(req.token);
});

// GET ROUTE(S)
//returns all documents if no id provided
router.get('/api/v1/:model', auth('read'), (req, res, next) => {
  const model = models[req.params.model];
  if (!model) {
    const err = { status: 404, statusMessage: 'NOT FOUND' };
    next(err);
    return;
  }
  model.find({}).populate('author')
    .then(result => sendJSON(result, res))
    .catch(error => { next(error); });

});

//returns a specific id
router.get('/api/v1/:model/:id', auth('read'), (req, res, next) => {
  const model = models[req.params.model];
  const id = req.params.id;

  if (!model) {
    const err = { status: 404, statusMessage: 'NOT FOUND' };
    next(err);
    return;
  }

  if (!id) {
    const err = { status: 400, statusMessage: 'Bad Request' };
    next(err);
    return;
  } else {
    model.findById({ _id: id }).populate('author')
      .then(book => sendJSON(book, res))
      .catch(error => {
        const err = { status: 404, statusMessage: 'NOT FOUND' };
        next(err);
      });
  }

});

// POST ROUTE
router.post('/api/v1/:model', auth('create'), (req, res, next) => {
  const model = models[req.params.model];
  const body = req.body;
  const authorInfo = {};
  authorInfo.name = body.author;

  console.log(authorInfo);

  if (!model) {
    const err = { status: 400, statusMessage: 'Bad Request' };
    next(err);
    return;
  }

  Author.create(authorInfo)
    .then(author => {
      const bookInfo = Object.assign({}, body, { author: author._id });

      Book.create(bookInfo)
        .then(result => {
          Book.findById({ _id: result._id }).populate('author')
            .then(newBook => sendJSON(newBook, res));

        })
        .catch(next);
    })
    .catch(next);
});

// PUT ROUTE
router.put('/api/v1/:model/:id', auth('update'), (req, res, next) => {
  const model = models[req.params.model];
  const id = req.params.id;
  const body = req.body;

  const authorInfo = {};
  authorInfo.name = body.author;

  const updateOptions = {
    new: true,
  };

  if (!model) {
    const err = { status: 404, statusMessage: 'NOT FOUND' };
    next(err);
    return;
  }

  Author.findOne(authorInfo)
    .then(author => {
      const bookInfo = Object.assign({}, body, { author: author._id });
      model.findByIdAndUpdate(id, bookInfo, updateOptions).populate('author')
        .then(result => sendJSON(result, res))
        .catch(next);
    });
});


// PATCH ROUTE
router.patch('/api/v1/:model/:id', auth('update'), (req, res, next) => {

  const model = models[req.params.model];
  const id = req.params.id;
  const body = req.body;

  const authorInfo = {};
  authorInfo.name = body.author;

  const updateOptions = {
    new: true,
  };

  if (!model) {
    const err = { status: 404, statusMessage: 'NOT FOUND' };
    next(err);
    return;
  }

  Author.findOne(authorInfo)
    .then(author => {
      const bookInfo = Object.assign({}, body, { author: author._id });
      model.findByIdAndUpdate(id, bookInfo, updateOptions).populate('author')
        .then(result => sendJSON(result, res))
        .catch(next);
    });
});


// DELETE ROUTE
router.delete('/api/v1/:model/:id', auth('delete'), (req, res, next) => {
  const model = models[req.params.model];
  const id = req.params.id;

  if (!model) {
    const err = { status: 404, statusMessage: 'NOT FOUND' };
    next(err);
    return;
  }

  model.findByIdAndDelete(id)
    .then(result => {
      result = { deleteRequest: 'completed' };
      sendJSON(result, res);
    })
    .catch(next);
});








export default router;