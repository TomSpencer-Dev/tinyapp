const cookieSession = require('cookie-session')
const express = require('express');
const { getUserByEmail } = require('./helper.js')
const { get } = require('request');
const { OPEN_READWRITE } = require('sqlite3');
// const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["anything", "something"]
}))

//Set ejs as the view engine
app.set("view engine", "ejs");

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
};

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


app.use(express.urlencoded({ extended: true }));

//Generate a Random Short URL ID
const generateRandomString = function() {
  let shortURL = "";

  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    shortURL += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return shortURL;
};




app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user === undefined) {
    res.send("<html><body><h2>You cannot shorten URL's because you are not logged in</h2></body></html>\n");
  } else {
    let shortURLID = generateRandomString();
    urlDatabase[shortURLID] = { longURL: req.body.longURL, userID: user.id };
    res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("<html><body><h2>Short url does not exist</h2></body></html>\n");
  }
  if (req.session.user_id === undefined) {
    res.send("<html><body><h2>Login or register to access urls</h2></body></html>\n");
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.send("<html><body><h2>This urls does not belong to you</h2></body></html>\n");
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
if (!urlDatabase[req.params.id]) {
    res.send("<html><body><h2>Short url does not exist</h2></body></html>\n");
  }
  if (req.session.user_id === undefined) {
    res.send("<html><body><h2>Login or register to access urls</h2></body></html>\n");
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.send("<html><body><h2>This urls does not belong to you</h2></body></html>\n");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const urlsForUser = function(id) {
    tempDB = {};
    for (let dbID in urlDatabase) {
      if (urlDatabase[dbID].userID === id) {
        tempDB[dbID] = urlDatabase[dbID];
      }

    }
    return tempDB;
  };
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };
  if (templateVars.user === undefined) {
    res.send("<html><body><h2>Login or register to access urls</h2></body></html>\n");
  } else {
    res.render("urls_index", templateVars);
  }
});


app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user === undefined) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("<html><body><h2>Short url does not exist</h2></body></html>\n");
  }
  if (req.session.user_id === undefined) {
    res.send("<html><body><h2>Login or register to access urls</h2></body></html>\n");
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.send("<html><body><h2>This urls does not belong to you</h2></body></html>\n");
  } else {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL === undefined) {
    res.send("<html><body><h2>That short URL id does not exist</h2></body></html>\n");
  } else {
    res.redirect(longURL);
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userInfo =  getUserByEmail(email, users) 
  // If a user with that e-mail cannot be found, return a response with a 403 status code.
  if (userInfo === undefined) {
    res.status(403).send("Error 403: Email cannot be found");
  }
  else if (!bcrypt.compareSync(password, userInfo.password)) {
    res.status(403).send("Error 403: Password does not match");
  } else {
    req.session.user_id = userInfo.id;
    // res.cookie('user_id', userInfo.id);
    res.redirect("/urls");
  }
});


app.post("/logout", (req, res) => {
  req.session = null;
  // res.clearCookie('user_id');
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user !== undefined) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).send(`Error 400: ${(email === '') ? "Email" : "Password"} was empty`);
  }
  if (getUserByEmail(email, users) !== undefined) {
    res.status(400).send("Error 400: Email already exists as a user");
  }
  const id = generateRandomString();
  const user = {
    id,
    email,
    password : bcrypt.hashSync(password, 10)
  };
  users[id] = user;
  req.session.user_id = id;
  // res.cookie('user_id', id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user !== undefined) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
