'use strict';

require('dotenv').config();

require('babel-polyfill');

require('babel-register');

const mongoose = require('mongoose');



mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

require('./src/server.js').start(process.env.PORT);