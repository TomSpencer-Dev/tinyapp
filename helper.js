//Module to contain helper functions

const { users, urlDatabase  } = require('./database.js'); //Load urlDatabase and users databases


//Function to check if user's email exists in the users database
const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

//urlsForUser function to create a temporary database of URLS owned by the current user
const urlsForUser = function(id) {
    let tempDB = {};
    for (let dbID in urlDatabase) {
      if (urlDatabase[dbID].userID === id) {
        tempDB[dbID] = urlDatabase[dbID];
      }

    }
    return tempDB;
  };

//Generate a Random Short URL ID
const generateRandomString = function() {
  let shortURL = "";

  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    shortURL += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return shortURL;
};

//Export function
module.exports = {getUserByEmail, urlsForUser, generateRandomString};