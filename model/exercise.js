require('dotenv').config()
const mongoose = require('mongoose')
const { Schema } = mongoose

const exerciseSchema = new Schema({
  userid: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now //if supplied, will overwrite this
  },
})

module.exports = mongoose.model('Exercise', exerciseSchema)