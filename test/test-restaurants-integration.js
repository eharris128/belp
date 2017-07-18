'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

//const {Beer} = require('../models');
const {Beer} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBeerData() {
  console.info('seeding beer data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateBeerData());
  }
  // this will return a promise
  return Beer.insertMany(seedData);
}

// used to generate data to put in db

// function generateStyleName() {
//   const styles = [
//     // 'Manhattan', 'Queens', 'Brooklyn', 'Bronx', 'Staten Island'
//     ];  //////////
//   return styles[Math.floor(Math.random() * styles.length)];
// }

// used to generate data to put in db

// function generateCuisineType() {
//   const cuisines = ['Italian', 'Thai', 'Colombian'];
//   return cuisines[Math.floor(Math.random() * cuisines.length)];
// }

// used to generate data to put in db

// function generateGrade() {
//   const grades = ['A', 'B', 'C', 'D', 'F'];
//   const grade = grades[Math.floor(Math.random() * grades.length)];
//   return {
//     date: faker.date.past(),
//     grade: grade
//   };
// }

// generate an object represnting a restaurant.
// can be used to generate seed data for db
// or request.body data
function generateBeerData() {
  return {
    name: faker.name.firstName(),
    abv: faker.random.number(),
    style: faker.lorem.sentences(),
    description: faker.lorem.sentences(),
    brewery: faker.lorem.sentence(),
    ibu: faker.random.number(),
    reviews: [{
        date: faker.date.recent(),
        content: faker.lorem.paragraphs()},
        
        {
        date: faker.date.recent(),
        content: faker.lorem.paragraphs()}
        ]
    // name: faker::beer.name(),
    // abv: Faker::Beer.style(),
    // style: generateCuisineType(),
    // description: {
    //   building: faker.address.streetAddress(),
    //   street: faker.address.streetName(),
    //   zipcode: faker.address.zipCode()
    // },
    // grades: [generateGrade(), generateGrade(), generateGrade()]
  };
}


// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure  ata from one test does not stick
// around for next one
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Beer API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBeerData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  // note the use of nested `describe` blocks.
  // this allows us to make clearer, more discrete tests that focus
  // on proving something small
  describe('GET endpoint', function() {

    it('should return all existing beers', function() {
      // strategy:
      //    1. get back all restaurants returned by by GET request to `/restaurants`
      //    2. prove res has right status, data type
      //    3. prove the number of restaurants we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
      let res;
      return chai.request(app)
        .get('/beers')
        .then(function(_res) {
          // so subsequent .then blocks can access resp obj.
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.beers.should.have.length.of.at.least(1);
          return Beer.count();
        })
        .then(function(count) {
          res.body.beers.should.have.length.of(count);
        });
    });


    it('should return beers with right fields', function() {
      // Strategy: Get back all restaurants, and ensure they have expected keys

      let resBeer;
      return chai.request(app)
        .get('/beers')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.beers.should.be.a('array');
          res.body.beers.should.have.length.of.at.least(1);

          res.body.beers.forEach(function(beer) {
            beer.should.be.a('object');
            beer.should.include.keys(
              'id', 'name', 'abv', 'style', 'description', 'brewery', 'ibu');
          });
          resBeer = res.body.beers[0];
          return Beer.findById(resBeer.id);
        })
        .then(function(beer) {

          resBeer.id.should.equal(beer.id);
          resBeer.name.should.equal(beer.name);
          resBeer.style.should.equal(beer.style);
          resBeer.description.should.equal(beer.description);
          resBeer.abv.should.equal(beer.abv);
          resBeer.brewery.should.equal(beer.brewery);
          resBeer.ibu.should.equal(beer.ibu);
          resBeer.reviews.should.equal(beer.reviews);
          // resBeer.address.should.contain(beer.address.building);

          // resBeer.grade.should.equal(beer.grade);
        });
    });
  });

  describe('POST endpoint', function() {
    // strategy: make a POST request with data,
    // then prove that the restaurant we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new beer', function() {

      const newBeer = generateBeerData();
      let mostRecentGrade;

      return chai.request(app)
        .post('/beers')
        .send(newBeer)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'name', 'style', 'description', 'reviews', 'brewery', 'ibu');
          res.body.name.should.equal(newBeer.name);
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.style.should.equal(newBeer.style);
          res.body.description.should.equal(newBeer.description);

          console.log(newBeer.reviews);
          let mostRecentReview = newBeer.reviews.sort(
            (a, b) => b.date - a.date)[0].reviews;
            
          res.body.reviews.should.equal(mostRecentReview);
          return Beer.findById(res.body.id);
        })
        .then(function(beer) {
          beer.name.should.equal(newBeer.name);
          beer.style.should.equal(newBeer.style);
          beer.description.should.equal(newBeer.description);
          beer.reviews.should.equal(mostRecentReview);
          beer.brewery.should.equal(newBeer.brewery);
          beer.ibu.should.equal(newBeer.ibu);
          // beer.address.zipcode.should.equal(newBeer.address.zipcode);
        });
    });

    it('should add new user', function (){
      const myTestUser = {
        username: faker.internet.userName(),
        password: '$2a$10$AmPJwn7FES9mV3ygK1DmvOlVHuO1oPg9idgYqXzTMjewvtp9goZF2',
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      };
      return chai.request(app)
        .post('/users')
        .send(myTestUser)
        .then(function(res){
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'username', 'firstName', 'lastName');  
          res.body.username.should.equal(myTestUser.username);
          res.body.firstName.should.equal(myTestUser.firstName);
          res.body.lastName.should.equal(myTestUser.lastName);
        }).then();
    });
  });

  describe('PUT endpoint', function() {

    // strategy:
    //  1. Get an existing restaurant from db
    //  2. Make a PUT request to update that restaurant
    //  3. Prove restaurant returned by request contains data we sent
    //  4. Prove restaurant in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = {
        name: 'fofofofofofofof',
        style: 'futuristic fusion'
      };

      return Beer
        .findOne()
        .exec()
        .then(function(beer) {
          updateData.id = beer.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/beers/${beer.id}`)
            .send(updateData);
        })
        .then(function(res) {
          res.should.have.status(204);

          return Beer.findById(updateData.id).exec();
        })
        .then(function(beer) {
          beer.name.should.equal(updateData.name);
          beer.style.should.equal(updateData.style);
        });
    });
  });

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a restaurant
    //  2. make a DELETE request for that restaurant's id
    //  3. assert that response has right status code
    //  4. prove that restaurant with the id doesn't exist in db anymore
    it('delete a restaurant by id', function() {

      let beer;

      return Beer
        .findOne()
        .exec()
        .then(function(_beer) {
          beer = _beer;
          return chai.request(app).delete(`/beers/${beer.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Beer.findById(beer.id).exec();
        })
        .then(function(_beer) {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_beer.should.be.null` would raise
          // an error. `should.be.null(_beer)` is how we can
          // make assertions about a null value.
          should.not.exist(_beer);
        });
    });
  });
});
