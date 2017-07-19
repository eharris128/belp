'use strict';

let appState = {
  beerData: {}
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
  let beerList = beerData.reviews.map(function(review, i){
    return (`<li>${review.comment}</li>`);
  }).join('');
    
  let stateRenderTemplate = (`
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

  $('.js-results').html(stateRenderTemplate).removeClass('hidden');
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
          updatesStateBeerData(currentBeer);
          stateRender(appState);
        } 
      }

    });
}

// Event Listener Functions

$(function(){

  // Event Listener not working for js-review button
  $('.js-results').on('click', '.js-review', function(event){
    event.preventDefault();
    console.log('clicked');
  });

  $('#js-form').submit(function(event) {
    event.preventDefault();
    let beerName = $('#beer-name').val();
    getApiData(beerName);
  
  });
});