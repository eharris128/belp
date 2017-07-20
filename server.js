'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const {BasicStrategy} = require('passport-http');
const morgan = require('morgan');

// Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
const {PORT, DATABASE_URL} = require('./config');

//const {Beer, User} = require('./models'); This line will replace the following line 
//after setting up Beer database 
const {Beer, User} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// User and authorization related functions
const strategy = new BasicStrategy(function(username, password, callback) {
  let user;
  User
    .findOne({username: username})
    .exec()
    .then(_user => {
      user = _user;
      if (!user) {
        return callback(null, false, {message: 'Incorrect username'});
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return callback(null, false, {message: 'Incorrect password'});
      }
      else {
        return callback(null, user);
      }
    });
});

passport.use(strategy);

// This endpoint should be removed at a later date as it reveals user data
// It can currently be used to visualize what users have been created in Postman

// GET request to /users
app.get('/users', (req, res) => {
  User
    .find()
    .limit(10)
    .exec()
    .then(users => {
      res.json({
        users: users.map(
          (user) => user.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
});

// POST request to /users

app.post('/users', (req, res) => {
  const requiredFields = ['username', 'password', 'firstName', 'lastName'];
  console.log(req.body);
  const missingIndex = requiredFields.findIndex(field => !req.body[field]);
  if (missingIndex !== -1) {
    return res.status(400).json({
      message: `Missing field: ${requiredFields[missingIndex]}`
    });
  }

  let {username, password, firstName, lastName} = req.body;
  username = username.trim();
  password = password.trim();
  // check for existing user
  return User
    .find({username})
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({message: 'username already taken'});
      }
      // if no existing user, hash password
      return User.hashPassword(password);
    })
    .then(hash => {
      return User
        .create({
          username,
          password: hash,
          firstName,
          lastName
        });
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      res.status(500).json({message: 'Internal server error'});
    });
});

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

// GET requests to /restaurants => return 10 restaurants
app.get('/beers', (req, res) => {
  Beer
    .find()
    // we're limiting because restaurants db has > 25,000
    // documents, and that's too much to process/return
    .limit(10)
    // .populate('author')
    .populate('user', 'firstName lastName')
    // .populate({
    //   path: 'reviews',
    //   populate: {
    //     path: 'author',
    //     model: 'User'
    //   }
    // })
    // `exec` returns a promise
    .exec()
    // success callback: for each restaurant we got back, we'll
    // call the `.apiRepr` instance method we've created in
    // models.js in order to only expose the data we want the API return.
    .then(beers => {
      res.json({
        beers: beers.map(
          (beer) => beer.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
});


// make a comment after class
// can also request by ID
app.get('/beers/:id', (req, res) => {
  Beer
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .exec()
    .then(beer =>res.json(beer.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.post('/beers', (req, res) => {
  // let firstName;
  // let lastName;
  // User.find({_id: req.body.reviews[0].author}).then(user => {
  //   return firstName = user[0].firstName;
  // });
  const requiredFields = ['name', 'style', 'abv', 'description', 'reviews', 'brewery', 'ibu', ];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  User.find({_id: req.body.reviews[0].author}).then(user => {
    console.log('ok')
    // create map function to through the users
    // go into reviews array and add in firstName and lastName
    //  Beer create {
    //   reviews: populateNames(res.body.reviews);  
    // }
  //console.log(typeof reviews);
  // maybe use for each instead of map? depends on if we need to be returning something to the
  // beer.reviews in the beer object
    let userReviews = res.body.reviews.map(function(review, i) {
      console.log('a review:' + review);
      // Look up how to add new key value pairs to objects
      // user[0] may work, need to determine how to correctly select user based on who is logged in
      review.firstName = user[0].firstName;
      console.log('a reviewers name:' + review.firstName);
      review.lastName = user[0].lastName;
    });



    Beer
      .create({
        name: req.body.name,
        abv: req.body.abv,
        style: req.body.style,
        reviews: userReviews,
        // reviews: populateReviewsWithNames(res.body.reviews),
        brewery: req.body.brewery,
        ibu: req.body.ibu,
        description: req.body.description})
      .then(
        beer => res.status(201).json(beer.apiRepr()))
      .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
  });
});

app.put('/beers/:id', 
  passport.authenticate('basic', {session: false}),
  (req, res) => {
  // ensure that the id in the request path and the one in request body match
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
      const message = (
        `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
      console.error(message);
      res.status(400).json({message: message});
    }

    // we only support a subset of fields being updateable.
    // if the user sent over any of the updatableFields, we udpate those values
    // in document
    const toUpdate = {};
    const updateableFields = ['name', 'style', 'description', 'reviews', 'brewery', 'ibu'];

    updateableFields.forEach(field => {
      if (field in req.body) {
        toUpdate[field] = req.body[field];
      }
    });

    Beer
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
      .findByIdAndUpdate(req.params.id, {$set: toUpdate}, {new: true})
      .exec()
      .then(updatedBeer => res.status(204).json(updatedBeer.apiRepr()))
      .catch(err => res.status(500).json({message: 'Internal server error'}));

  });

app.delete('/beers/:id', (req, res) => {
  Beer
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(beer => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};
