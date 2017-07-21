# Belp
This app is made for the beer lovers to express whet they believe, feel, experience, and love when they need to let the world know about the very sustance that improves and and chaanges the world around us. 

## Description <br/> 
This App was brainstormed up while we, as students, sat in a slack channel waiting for a response on a heavy request day, but not really knowing when a response would come, or what our standing was. Enter in Tick-it, the web app that allows Thinkful TA's and students to stay organized on a transparent platform. TA's are able to keep track of requests submitted by students who need assistance with a variety of coding challenges, while students are able to keep track of the requests they have submitted and where they line up on the queue. 

## Technology Used <br/>
**FrontEnd**: HTML, CSS, Javascript<br/>
**BackEnd**: NodeJS, Express, MongoDB, Mongoose, Mlab<br/>
**Deployment**: Heroku, Travis <br/> 

## Documentation of API <br/>
* **GET** https://boiling-refuge-95989.herokuapp.com/beers<br/>
  * This allows you to get all the Beers in the database <br/>
  * This is used to display all the Beers in the frontend persistently</br>
* **POST** https://boiling-refuge-95989.herokuapp.com/beers<br/>
  * This allows you to post a Beer into the database <br/>
  * This is used to allow student users (who do not need to log in) to submit a Beer
* **PUT** https://boiling-refuge-95989.herokuapp.com/beers/:id <br/>
  * This allows Belp users that are logged in to update a Beer in the database <br/>
  * This is used to allow Belp users to update the status of a Beer <br/>
* **DELETE** https://boiling-refuge-95989.herokuapp.com/beers/:id <br/>
  * This allows you to delete a Beer from the database <br/>
  * This is used to allow student users to delete the Beer if they don't need help <br/>
  * This is used to allow Belp users to delete the Beer once they are finished with it <br/>
* **GET** https://boiling-refuge-95989.herokuapp.com/users <br/>
  * This allows Belp users that are logged in to get their username and fullName from the database <br/>
  * This is used to allow us to store the username and fullname into a localStorage once the Belp logs in <br/>
* **POST** https://boiling-refuge-95989.herokuapp.com/users/:id <br/>
  * This allows you to add a user into the database <br/>
  * This is used to allow people to sign up as a Belp user <br/>

## How To Use our code <br/>
* Fork it to your Repo
* Git clone the Repo link
```git clone [repo link]```
* Move into the project directory: 
```cd ~/YOUR_PROJECTS_DIRECTORY/YOUR_PROJECT_NAME```
* Run `npm install` in the terminal => install all the dependencies
* Make sure MongoDB is installed
* Run `mongod` in the terminal => to run the mongodb server 
* Run `npm start` in the terminal => to run the client and backend server
    * Starts a server running at http://localhost:8080


## Contributing 

* Please refer to [contributing.md](/contributing.md)

## Authors


* **Evan Harris** - [eharris128](https://github.com/eharris128)
* **William McKelvey** - [52lions06](https://github.com/52lions06)<br>


## Acknowledgments
* Thank you Thinkful for giving us the opportunity to develop our project throughout this week 
* Thanks to Chris for helping to teach us the back-end mechanics these past few weeks, hope all is well for you in the future
* Thanks to Elias, Joshua, and Sidharthchugh for all of their guidance and assistance to help improve our code.
* Thanks to cohort 12 for being so supportive 


