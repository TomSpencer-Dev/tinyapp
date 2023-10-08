//Module to contain databases

  //Database of URLs
  const urlDatabase = {
    b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID",
    },
    i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "userRandomID",
    },
  }

//Database of users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$punr8lynWBJSpBDWeDMFPe776jSzkC/ywLaoWo4fU0YBBDOY2cuvC",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$punr8lynWBJSpBDWeDMFPe776jSzkC/ywLaoWo4fU0YBBDOY2cuvC",
  },
};

//Export objects
module.exports = { users, urlDatabase };