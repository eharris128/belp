'use strict';

let appState = {
  beerData: {},
  userLoggedIn: false,
  userQueryPresentInDb: false
};

// State Modification Functions 

function resetState() {
  appState.userLoggedIn = false;
  appState.userQueryPresentInDb = false;
}

function updatesStateUserLogin(){
  appState.userLoggedIn = !appState.userLoggedIn;
}

function updatesStateBeerData(userSearchBeer) {
  appState.beerData = userSearchBeer;
}


// Render Functions

// function showDOMStuff(state) {
//   if state.err {
//     //take specific render path
//   }

// }

// function renderError(state){

// }
function stateRender(state) {
  const { beerData } = state;
  const loggedIn =  state.userLoggedIn;

  if (!state.userQueryPresentInDb) {
    let errorMessageTemplate = (`
    <h3> The beer you searched for does not appear to be in the database. <br> Please try again. </h3>
    `);
    $('.js-results').html(errorMessageTemplate).removeClass('hidden');
  }

  if (beerData.name !== undefined && state.userQueryPresentInDb !== false) {

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

function getApiData(userQuery) {
  fetch('/beers')
    .then(res => {
      return res.json();
    })
    .then(data => {
      if (data.beers.includes(userQuery)) {
        // function for successful query
        //the line below should be made into state modification function
        appState.userQueryPresentInDb = true;
        updatesStateBeerData(userQuery);
        stateRender(appState);
      } else {
        // function for unsuccessful query
        stateRender(appState);
      }
    })
    .catch(err => {
      console.error(err);
    });

  //   for (let i = 0; i < data.beers.length; i++) {
  //     let currentBeer = data.beers[i];

  //   }
  //   if (!appState.userQueryPresentInDb) {
  //     stateRender(appState);
  //   }
  // })

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
    });
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
    let userQuery = $('#beer-name').val();
    getApiData(userQuery);
    $('#beer-name').val('');
  });

  $('.js-results').on('click', '.js-review', function(event){
    event.preventDefault();
  });

});