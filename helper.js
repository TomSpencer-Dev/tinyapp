//Module to contain helper functions

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

//Export function
module.exports = {getUserByEmail, urlsForUser};