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

});

// create the pre methods
userSchema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 10);
});

// Create a JSON Token from the user id and a password
userSchema.methods.generateToken = function () {
  return jwt.sign({ username: this.username }, this.password);
};

// Compare a plain text password against the hashed one on file
userSchema.methods.comparePassword = async function (password) {

  const validPass = await bcrypt.compare(password, this.password);

  return (validPass ? this : null);
};

// Validate the a token if that was sent
userSchema.statics.authenticate = function (auth) {

  let query = { username: auth.username };

  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(error => error);
};

export default mongoose.model('Users', userSchema);