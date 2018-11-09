// require('dotenv').config();


// Load mongoose to work with mongo
import mongoose, { Schema } from 'mongoose';

// Load the hashing module
import bcrypt from '../middleware/hashing.js';

// Load JSON tokensation module
import jwt from 'jsonwebtoken';

// define the user schema
const userSchema = new Schema({

  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'user', enum: ['admin', 'editor', 'user'] },

});

// create the Access Control List (ACL) parameters
const capabilities = {
  user: ['read'],
  editor: ['create', 'read', 'update'],
  admin: ['create', 'read', 'update', 'delete'],
};

// create the pre methods
userSchema.pre('save', async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) { throw error; }
});


// Verify users role on ACL
userSchema.methods.can = function (capability) {
  return capabilities[this.role].includes(capability);
};

// Create a JSON Token from the user id and a password
userSchema.methods.generateToken = function () {
  let tokenData = {
    id: this._id,
    capabilities: capabilities[this.role],
  };

  // FIXME: dotenv not passing process.env.APP_SECRET value for tests.  Using 'SECRET' for tests only.

  // return jwt.sign(tokenData, process.env.APP_SECRET);
  return jwt.sign(tokenData, 'SECRET');
};

// Compare a plain text password against the hashed one on file
userSchema.methods.comparePassword = async function (password) {

  try {
    const valid = await bcrypt.compare(password, this.password);
    return (valid ? this : null);

  } catch (error) { throw error; }

};

userSchema.statics.authenticateBasic = async function (auth) {
  let query = { username: auth.username };

  try {
    const user = await this.findOne(query);
    return (user && user.comparePassword(auth.password));

  } catch (error) { throw error; }

};


// Validate the a token if that was sent
userSchema.statics.authenticateToken = function (token) {

  // FIXME: dotenv not passing process.env.APP_SECRET value for tests.  Using 'SECRET' for tests only.
  try {
    // let parsedToken = jwt.verify(token, process.env.APP_SECRET);
    let parsedToken = jwt.verify(token, 'SECRET');

    let query = { _id: parsedToken.id };

    return this.findOne(query)
      .then(user => { return user; })
      .catch(error => error);

  } catch (error) { throw error; }

};

export default mongoose.model('Users', userSchema);