const mongoose = require('mongoose');

// this is our schema to represent a restaurant
const beerSchema = mongoose.Schema({
  name: {type: String, required: true},
  abv: {type: Number, required: true},
  style: String,
  description: {type: String, required: true},
  brewery: String,
  ibu: Number,
  // {
  //   building: String,
  //   // coord will be an array of string values
  //   coord: [String],
  //   street: String,
  //   zipcode: String
  // },
  // grades will be an array of objects
  review: [{
    date: Date,
    comment: String,
    score: Number
  }]
});

// *virtuals* (http://mongoosejs.com/docs/guide.html#virtuals)
// allow us to define properties on our object that manipulate
// properties that are stored in the database. Here we use it
// to generate a human readable string based on the address object
// we're storing in Mongo.
beerSchema.virtual('addressString').get(function() {
  return `${this.address.building} ${this.address.street}`.trim()});

// this virtual grabs the most recent grade for a restaurant.
beerSchema.virtual('review').get(function() {
  const reviewObj = this.reviews.sort((a, b) => {return b.date - a.date})[0] || {};
  return reviewObj.review;
});

// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
beerSchema.methods.apiRepr = function() {

  return {
    id: this._id,
    name: this.name,
    style: this.style,
    description: this.description,
    review: this.review,
    brewery: this.brewery,
    ibu:this.ibu
  };
};


// note that all instance methods and virtual properties on our
// schema must be defined *before* we make the call to `.model`.
const Beer = mongoose.model('Beer', beerSchema);

module.exports = {Beer};
