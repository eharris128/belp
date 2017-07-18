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
function updatesStateBeerData(MOCK_BEER_DATA) {
  appState.beerData = MOCK_BEER_DATA;
  // console.log('my app state' + appState.beerData.Name);
}

// Render Functions
function stateRender(state) {
  const { beerData } = state;
  console.log(beerData.Reviews[0]);
  let stateRenderTemplate = (`
    <h2> Beer Name: ${beerData.Name}</h2
    <p> Style: ${beerData.Style}</p>
    <p> ABV: ${beerData.ABV}</p>
    <p> IBU: ${beerData.IBU}</p>
    <p> Description: ${beerData.Description}</p>
    <p> Brewery: ${beerData.Brewery}</p>
    <p> Reviews: ${beerData.Reviews}</p>
    `);
  $('.js-results').removeClass('hidden');
  $('.js-results').html(stateRenderTemplate);
}

// Data Retrieval functions
// Retrieve Data from DB
// Send JSON from DB to render functions and other functions that need it

function getApiData(beerName) {
  console.log(beerName);
  // return fetch (`our Url endpoint here`)
  fetch('/beers')
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log(data);
      console.log(data.beers[0].name);
      for (let i = 0; i < data.beers.length; i++) {
        let currentBeer = data.beers[i].name;
        if (currentBeer === beerName) {
          console.log('Wahoo');
        } else {
          console.log('suh sad');
        }
      }

    });
  //.then
  updatesStateBeerData(MOCK_BEER_DATA);
  stateRender(appState);
}


// Event Listener Functions

function submitBeerName() {
  $('#js-form').submit(function(event) {
    event.preventDefault();
    let beerName = $('#beer-name').val();
    getApiData(beerName);
    // getAndDisplayStatusUpdates();
    // Move the below class removal statement into the render function after it is made.
  });
}

$(function(){
  submitBeerName();
});

// Add these functions and the call to getAndDisplayStatusUpdates() to see basic data visualization.

// function getRecentStatusUpdates(callbackFn) {
//   setTimeout(function(){ callbackFn(MOCK_BEER_DATA);}, 100);
// }

// function displayStatusUpdates(data) {
//   $('body').append(
//     '<p>' + data.beer[0].Name + '</p>');
//   console.log(data.beer[0].Name);
// }

// function getAndDisplayStatusUpdates() {
//   getRecentStatusUpdates(displayStatusUpdates);
// }