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

//Export function
module.exports = {getUserByEmail};