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
userSchema.pre('save', function (next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(error => { throw error; });
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
  return jwt.sign(tokenData, process.env.SECRET);
};

// Compare a plain text password against the hashed one on file
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};

userSchema.statics.authenticateBasic = function (auth) {
  let query = { username: auth.username };
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(console.error);
};


// Validate the a token if that was sent
userSchema.statics.authenticateToken = function (token) {
  let parsedToken = jwt.verify(token, process.env.SECRET);
  let query = { _id: parsedToken.id };
  return this.findOne(query)
    .then(user => {
      return user;
    })
    .catch(error => error);
};

export default mongoose.model('Users', userSchema);