//Change approach, from having a single model for both user and exercise,
//as in exercise in user, to have 2 separate model for user and exercise.

require('dotenv').config()
const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  //id default mongoose
  username: {
    type: String,
    required: true,
  }
})

module.exports = mongoose.model('User', userSchema)