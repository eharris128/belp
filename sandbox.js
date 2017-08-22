'use strict';


const {Beer} = require('./models.js');
const mongoose = require('mongoose');
const { DATABASE_URL } = require('./config');
mongoose.connect(DATABASE_URL, () => {

  Beer
    .find({})
    .populate('reviews.author')
    .then(function(beers){
      console.log('======', JSON.stringify(beers, null, 4));
    });
});