'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// this is our schema to represent a beer
const beerSchema = mongoose.Schema({
  name: {type: String, required: true},
  abv: {type: Number, required: true},
  style: String,
  description: {type: String, required: true},
  brewery: String,
  ibu: Number,
  reviews: [{
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: { type: Date, default: Date.now },
    comment: String
  }]
});

// myuser123 ; password
const UserSchema = mongoose.Schema({
  // _creator: { type: Number, ref: 'Beer'},
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Beer'}],
  username:{
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''}
});

// *virtuals* (http://mongoosejs.com/docs/guide.html#virtuals)
// allow us to define properties on our object that manipulate
// properties that are stored in the database. Here we use it
// to generate a human readable string based on the address object
// we're storing in Mongo.

// beerSchema.virtual('').get(function() {
//   return `${this.address.building} ${this.address.street}`.trim();});

// this virtual grabs the most recent grade for a restaurant.
beerSchema.virtual('review').get(function() {
  const reviewObj = this.reviews.sort((a, b) => {return b.date - a.date;})[0] || {};
  return reviewObj.review;
});

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
beerSchema.methods.apiRepr = function() {

  return {
    id: this._id,
    name: this.name,
    abv: this.abv,
    style: this.style,
    description: this.description,
    reviews: this.reviews,
    brewery: this.brewery,
    ibu:this.ibu
  };
};

// User related functions

UserSchema.methods.apiRepr = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || ''
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt
    .compare(password, this.password)
    .then(isValid => isValid);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt
    .hash(password, 10)
    .then(hash => hash);
};

// note that all instance methods and virtual properties on our
// schema must be defined *before* we make the call to `.model`.
const Beer = mongoose.model('Beer', beerSchema);
const User = mongoose.model('User', UserSchema);

module.exports = {Beer, User};
