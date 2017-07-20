'use strict';

let appState = {
  beerData: {},
  userLoggedIn: false,
  userQueryInDb: false
};

// State Modification Functions 

function resetState() {
  appState.userLoggedIn = false;
  appState.userQueryInDb = false;
}

function updatesStateUserLogin(){
  appState.userLoggedIn = !appState.userLoggedIn;
}

function updatesStateBeerData(userSearchBeer) {
  appState.beerData = userSearchBeer;
}


// Render Functions

function stateRender(state) {
  const { beerData } = state;
  const loggedIn =  state.userLoggedIn;

  if (!state.userQueryInDb) {
    let errorMessageTemplate = (`
    <h3> The beer you searched for does not appear to be in the database. <br> Please try again. </h3>
    `);
    $('.js-results').html(errorMessageTemplate).removeClass('hidden');
  }

  if (beerData.name !== undefined && state.userQueryInDb !== false) {

    let beerList = beerData.reviews.map(function(review, i){
      return (`
    <li><p>${review.author.firstName} ${review.author.lastName}: ${review.comment}</p></li>
    `);
    }).join('');
    
    let beerInfoTemplate = (`
    <h2> Beer Name: ${beerData.name}</h2
    <p> Style: ${beerData.style}</p>
    <p> ABV: ${beerData.abv}</p>
    <p> IBU: ${beerData.ibu}</p>
    <p> Description: ${beerData.description}</p>
    <p> Brewery: ${beerData.brewery}</p>
    <h3> Reviews: </h3>
    <ul> ${beerList} </ul>
    <button class="js-review" type="button"> Click to leave a review </button>
    `);

    $('.js-results').html(beerInfoTemplate).removeClass('hidden');
  } else if ( loggedIn) {
    $('.js-loggedIn').removeClass('hidden');
  } 
}
 

// Data Retrieval functions

function getApiData(beerName) {
  fetch('/beers')
    .then(res => {
      return res.json();
    })
    .then(data => {
      for (let i = 0; i < data.beers.length; i++) {
        let currentBeer = data.beers[i];
        if (currentBeer.name === beerName) {
          appState.userQueryInDb = true;
          updatesStateBeerData(currentBeer);
          stateRender(appState);
        } 
      }
      if (!appState.userQueryInDb) {
        stateRender(appState);
      }
    })
    .catch(err => {
      console.error(err);
    });
}

// User Endpoint Functions

function createUser(userData) {
  const opts = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST', 
    body: JSON.stringify(userData)
  };
  fetch('/users', opts)
    .then(function(res){
      return res.body;
    })
    .then(function(res) {
      updatesStateUserLogin();
      stateRender(appState);
    })
    .catch(err => {
      console.err(err);
    })
}
// Event Listener Functions

$(function(){

  $('.js-signup-form').on('submit', function(event){
    resetState();
    const userFields = $('.js-signup-form input');
    event.preventDefault();
    let userData = {};

    $.each(userFields, function(i, field){
      userData[field.name] = field.value;
    });
    createUser(userData);
    userFields.val('');
  });
  
  $('.js-beer-form').submit(function(event) {
    resetState();
    event.preventDefault();
    let beerName = $('#beer-name').val();
    getApiData(beerName);
    $('#beer-name').val('');
  });

  $('.js-results').on('click', '.js-review', function(event){
    event.preventDefault();
  });

});