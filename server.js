require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const User = require('./model/user')
const Exercise = require('./model/exercise')

mongoose.connect(process.env.MLAB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(res => {
  console.log('Connected to MongoDB')
}).catch((err) => {
  console.log('Error connecting to MongoDB: ', err.message)
})

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
//app.use(bodyParser.json())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

//Creating new user.
//POST user's username
//then return the username and id
app.post('/api/users', (req, res) => {
  let uname = req.body.username //get username from POST body (form)
  User.create({ username: uname }, (err, data) => {
    if (err) console.log(err)
    res.json({ username: data.username, _id: data._id })
  })
})

//GET username
app.get('/api/users', (req, res) => {
  User.find({}, (err, data) => {//find all username
    if (err) console.log(err)
    res.json(data)
  })
})

//POST /api/user/:id/exercises
//create new exercise
app.post('/api/users/:id/exercises', (req, res) => {
  let { description, duration, date } = req.body
  let userid = req.params.id
  //find user by id, return username
  User.findById(userid).then(user => {
    if (!user) { //user not found
      throw new Error('Not found user with this id')
    }
    let username = user.username
    Exercise.create({ userid, description, duration, date }, (err, data) => {
      if (err) console.log(err)
      //let date = new Date(data.date)
      res.json({
        username: username,
        _id: data.userid,
        description: data.description,
        duration: data.duration,
        date: data.date.toDateString()
      })
    })
  }).catch((err) => {
    console.log(err)
    res.send(err.message)
  })
})

//GET /api/users/:_id/logs?[from][&to][&limit]
//get user's full exercise logs
app.get('/api/users/:_id/logs', (req, res) => {
  let id = req.params._id
  let { from, to, limit } = req.query //destructuring to get the query
  if (from) {
    from = new Date(from)
  } else {
    from = new Date(0)
  }
  if (to) {
    to = new Date(to)
  } else {
    to = new Date() //make the date equal to now, so get query till current date
  }
  if (limit === undefined) {
    limit = 0
  }

  User.findById(id).then(user => {
    let username = user.username

    Exercise.find({ userid: id })
      .where('date').gte(from).lte(to)
      .limit(parseInt(limit)).exec()
      .then(log => res.status(200).send({
        _id: id,
        username: username,
        count: log.length,
        log: log.map(exercise => ({
          description: exercise.description,
          duration: exercise.duration,
          date: new Date(exercise.date).toDateString(),
        }))
      }))
    /*
    Exercise.find({ userid: id }).then(log => res.send({
      log: log.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
      })),
      username: username,
      count: log.length,
      _id: id,
    }))
    */
  }).catch(err => {
    console.log(err)
    res.status(500).send(err.message)
  })
})

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: 'not found' })
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
