import express from 'express';

import Book from '../models/books-model';
import Author from '../models/author-model.js';

import sendJSON from '../middleware/sendJSON.js';

import notFound from '../middleware/404.js';
import errorHandler from '../middleware/error.js';

//setup the API "dictionary"
const models = {
  'books': Book,
  'author': Author,
};

const router = express.Router();

// GET ROUTE(S)
//returns all documents if no id provided
router.get('/api/v1/:model', (req, res, next) => {
  const model = models[req.params.model];
  if (!model) {
    errorHandler('model not found', req, res, next);
    return;
  }
  model.find({}).populate('author')
    .then(result => sendJSON(result, res))
    .catch(next);
});

//returns a specific id
router.get('/api/v1/:model/:id', (req, res, next) => {
  const model = models[req.params.model];
  const id = req.params.id;

  if (!model) {
    errorHandler('model not found', req, res, next);
    return;
  }

  if (!id) {
    errorHandler('bad request', req, res, next);
    return;
  } else {
    model.findById({ _id: id }).populate('author')
      .then(book => sendJSON(book, res))
      .catch(next);
  }

});

// POST ROUTE
router.post('/api/v1/:model', (req, res, next) => {
  const model = models[req.params.model];

  const body = req.body;

  const authorInfo = {};
  authorInfo.name = body.author;

  console.log(authorInfo);

  if (!model) {
    notFound('model not found', req, res, next);
    return;
  }
});

// PUT ROUTE
router.put('/api/v1/:model/:id', (req, res, next) => {
  const model = models[req.params.model];
  const id = req.params.id;
  const body = req.body;
  const updateOptions = {
    new: true,
  };

  if (!model) {
    errorHandler('model not found', req, res, next);
    return;
  }

  model.findByIdAndUpdate(id, body, updateOptions)
    .then(result => sendJSON(result, res))
    .catch(next);
});

// TODO: I'm not sure I fully understand the differnece between PUT and PATCH:

// PATCH ROUTE
router.patch('/api/v1/:model/:id', (req, res, next) => {

  const model = models[req.params.model];
  const id = req.params.id;
  const body = req.body;
  const updateOptions = {
    new: true,
  };

  if (!model) {
    errorHandler('model not found', req, res, next);
    return;
  }

  model.findByIdAndUpdate(id, body, updateOptions)
    .then(result => sendJSON(result, res))
    .catch(next);

});

// DELETE ROUTE
router.delete('/api/v1/:model/:id', (req, res, next) => {
  const model = models[req.params.model];
  const id = req.params.id;

  if (!model) {
    errorHandler('model not found', req, res, next);
    return;
  }

  model.findByIdAndDelete(id)
    .then(result => sendJSON(result, res))
    .catch(next);
});

export default router;

/* Stretch goal: add the below routes and get them to work 
app.get('/', auth(), (req,res) => {
  res.send('hi from /');
});
app.get('/s', auth('create'), (req,res) => {
  res.send('hi from /s');
});
app.get('/d', auth('delete'), (req,res) => {
  res.send('hi from /d');
});
*/

