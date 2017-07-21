'use strict';

let appState = {
  beerData: {},
  userLoggedIn: false,
  userQueryInDb: false,
  reviewEntry: false,
  searchBeerId: ''
};

// State Modification Functions 

function resetState() {
  appState.reviewEntry = false;
  appState.userLoggedIn = false;
  appState.userQueryInDb = false;
  appState.searchBeerId = '';
}

function updatesStateUserLogin(){
  appState.userLoggedIn = !appState.userLoggedIn;
}

function updatesStateBeerData(userSearchBeer) {
  appState.beerData = userSearchBeer;
}

function updatesStateQueryStatus (state) {
  state.userQueryInDb = true;
}

function updatesStateSearchBeerId(searchBeerId) {
  appState.searchBeerId = searchBeerId;
}

function updatesStateReviewStatus() {
  if (!appState.reviewEntry) {
    appState.reviewEntry = true;
  } else if (appState.reviewEntry) {
    appState.reviewEntry = false;
  }

}

// Render Functions

function renderErrorMessage(status) {
  if (status === 200) {
    let beerNotInDatabaseError = (`
    <h3> The beer you searched for does not appear to be in the database. <br> Please try again. </h3>
    `);
    $('.js-results').html(beerNotInDatabaseError).removeClass('hidden');
  } else if (status === 422) {
    let usernameTakenError = (`
      <h3> That username is taken, please try a different one.</h3>
    `);
   
    $('.js-login-error').html(usernameTakenError).removeClass('hidden');
    $('.js-loggedIn').addClass('hidden');
  }
}

function stateRender(state) {
  $('.js-login-error').addClass('hidden');
  $('.js-loggedIn').addClass('hidden');

  const { beerData } = state;
  const loggedIn =  state.userLoggedIn;
  const reviewEntry = state.reviewEntry;

  if (reviewEntry) {
    let reviewEntryTemplate = (`
      <form action="#" id="review-form" name="reviewForm" class="js-review-form">
			<fieldset>
				<label class="input-label" for="review">Please leave your review below: </label>
				<input class="input-box" type="text" name="review" id="review" required placeholder="I really enjoyed...">
			</fieldset>
			<button class ="button submit-button" type="submit">Submit Review</button>
		</form>
    `);
    $('.js-results').append(reviewEntryTemplate);
  } else if (beerData.name !== undefined) {
    
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
  let status;
  fetch('/beers')
    .then(res => {
      status = res.status;
      return res.json();
    })
    .then(data => {
      for (let i = 0; i < data.beers.length; i++) {
        let currentBeer = data.beers[i];
        if (currentBeer.name === userQuery) {
          updatesStateSearchBeerId(currentBeer.id);
          updatesStateQueryStatus(appState);
          updatesStateBeerData(currentBeer);
          stateRender(appState);
        } 
      }
      if (!appState.userQueryInDb) {
        renderErrorMessage(status);
      }
    })
    .catch(err => {
      console.error(err);
    });
}

function sendReviewData(userReview) {
  let formattedReview = {
    id: appState.searchBeerId,
    reviews: [
      {
        author: {
          _id: '5972272a11da9e2ac0cce544'
        },
        comment: userReview,
        date: Date.now()
      }
    ]

  };
  
  console.log('the user review: ' + formattedReview);
  // hard code password in for test submission and then change to cookies or something else
  const opts = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Basic dGVzdHVzZXI6cGFzc3dvcmQ='
    },
    method: 'PUT',
    body: JSON.stringify(formattedReview) 
  };
  fetch(`/beers/${appState.searchBeerId}`, opts)
    .then(function(res) {
      console.log('does it work?');
      return res;
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
      return res;
    })
    .then(function(res) {
      console.log('what does a user look like: ' + res);
      if (res.status === 422) {
        renderErrorMessage(res.status);
      } else {
        updatesStateUserLogin();
        stateRender(appState); 
        return res;
      }
    })
    .then()
    .catch(err => {
      return err;
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
    updatesStateReviewStatus();
    stateRender(appState);
  });

  $('.js-results').on('submit', '.js-review-form', function(event){
    event.preventDefault();
    let userReview =  $('#review').val();
    sendReviewData(userReview);
    // the below line should be moved to the appropriate function
    $('#review').val('');
    console.log('Thank you for submitting your review');
  });
  
});