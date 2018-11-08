import mongoose, { Schema } from 'mongoose';

//Author Schema
const authorSchema = new Schema({
  name: String,
});


//Schema methods



// Author Model

export default mongoose.model('Authors', authorSchema);