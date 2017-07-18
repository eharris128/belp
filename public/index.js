'use strict';

let appState = {
  beerData: {}
};

// Fake Data to Populate Front-End

let MOCK_BEER_DATA = {
  'id': '1234',
  'Name': 'Super Duper Beer',
  'ABV': '100%',
  'Style': 'Belgian Wheat Ale',
  'IBU': '5',
  'Description': 'Hoppy and Fruity',
  'Brewery': 'Local Brew',
  'Reviews': [ 'Decent', 'Terrible', 'Tasty']
};

// State Modification Functions
function updatesStateBeerData(userSearchBeer) {
  console.log(userSearchBeer);
  appState.beerData = userSearchBeer;
  // console.log('my app state' + appState.beerData.Name);
}

// Render Functions
function stateRender(state) {
  const { beerData } = state;
  let stateRenderTemplate = (`
    <h2> Beer Name: ${beerData.name}</h2
    <p> Style: ${beerData.style}</p>
    <p> ABV: ${beerData.abv}</p>
    <p> IBU: ${beerData.ibu}</p>
    <p> Description: ${beerData.description}</p>
    <p> Brewery: ${beerData.brewery}</p>
    <ul> Reviews: 
      <li>${beerData.reviews[0].comment}</li>
      <li>${beerData.reviews[1].comment}</li>
    </ul>
    <button class="js-review" type="button"> Click to leave a review </button>
    `);

  $('.js-results').removeClass('hidden');
  $('.js-results').html(stateRenderTemplate);
}

// Data Retrieval functions

function getApiData(beerName) {
  // console.log('User input beer name:' + beerName);
  fetch('/beers')
    .then(res => {
      return res.json();
    })
    .then(data => {
      for (let i = 0; i < data.beers.length; i++) {
        let currentBeer = data.beers[i];
        if (currentBeer.name === beerName) {
          updatesStateBeerData(currentBeer);
          stateRender(appState);
        } 
      }

    });
}


// Event Listener Functions

$(function(){

  // Event Listener not working for js-review button
  $('.js-review').on('click', function(event){
    event.preventDefault();
    console.log('clicked');
  });

  $('#js-form').submit(function(event) {
    event.preventDefault();
    let beerName = $('#beer-name').val();
    getApiData(beerName);
  
  });
});