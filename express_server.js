//Server file to handle Get and Post endpoints

const cookieSession = require('cookie-session');   //Load cookie-session to store cookies
const express = require('express');                //Load express
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helper.js'); //Load getUserByEmail, urlsForUser, and generateRandomString functions
const { users, urlDatabase  } = require('./database.js'); //Load urlDatabase and users databases
const app = express();                             //Create app variable that utilizes the express function
const PORT = 8080;                                 // default port 8080
const bcrypt = require("bcryptjs");                //Load bcrypt to

app.use(cookieSession({
  name: 'session',
  keys: ["anything", "something"]
}));

//Set ejs as the view engine
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

//POST /urls endpoint - Generates new short URL ID - Displays short URL ID and user inputted long URL
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    const templateVars = { user: users[req.session.user_id], message: "You cannot shorten URL's because you are not logged in", errorCode: "401" };
    return res.status(401).render("urls_error", templateVars);
  } else if (!req.body.longURL) {
    const templateVars = { user: users[req.session.user_id], message: "No long URL entered", errorCode: "400" };
    return res.status(400).render("urls_error", templateVars);
  } else {
    let shortURLID = generateRandomString();
    urlDatabase[shortURLID] = { longURL: req.body.longURL, userID: user.id };
    return res.redirect("/urls/" + shortURLID);
  }
});

//POST /urls/:id endpoint - :id is a dynamic value -
app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const templateVars = { user: users[req.session.user_id], message: "Short url does not exist", errorCode: "404" };
    return res.status(404).render("urls_error", templateVars);
  } else if (!req.session.user_id) {
    const templateVars = { user: users[req.session.user_id], message: "Login or register to access urls", errorCode: "401" };
    return res.status(401).render("urls_error", templateVars);
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    const templateVars = { user: users[req.session.user_id], message: "This urls does not belong to you", errorCode: "401" };
    return res.status(401).render("urls_error", templateVars);
  } else if (!req.body.longURL) {
    const templateVars = { user: users[req.session.user_id], message: "No long URL entered", errorCode: "400" };
    return res.status(400).render("urls_error", templateVars);
  } else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    return res.redirect("/urls");
  }
});

//POST /urls/:id/delete endpoint - deletes short URL ID that is equal to :id(dynamic value)
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const templateVars = { user: users[req.session.user_id], message: "Short url does not exist", errorCode: "404" };
    return res.status(404).render("urls_error", templateVars);
  } else if (!req.session.user_id) {
    const templateVars = { user: users[req.session.user_id], message: "Login or register to access urls", errorCode: "401" };
    return res.status(401).render("urls_error", templateVars);
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    const templateVars = { user: users[req.session.user_id], message: "This urls does not belong to you", errorCode: "401" };
    return res.status(401).render("urls_error", templateVars);
  } else {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  }
});

//GET /urls endpoint - renders urls_index if logged in
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };
  if (!templateVars.user) {
    const templateVars = { user: users[req.session.user_id], message: "Login or register to access urls", errorCode: "401" };
    return res.status(401).render("urls_error", templateVars);
  } else {
    return res.render("urls_index", templateVars);
  }
});

//GET /urls/new endpoint - renders urls_new if logged in and the short URL ID belongs to the user
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (!templateVars.user) {
    return res.redirect("/login");
  } else {
    return res.render("urls_new", templateVars);
  }
});

//GET /urls/:id endpoint - renders urls_show if logged in and the short URL ID belongs to the user
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    const templateVars = { user: users[req.session.user_id], message: "Short url does not exist", errorCode: "404" };
    return res.status(404).render("urls_error", templateVars);
  }
  if (!req.session.user_id) {
    const templateVars = { user: users[req.session.user_id], message: "Login or register to access urls", errorCode: "401" };
    return res.status(401).render("urls_error", templateVars);
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    const templateVars = { user: users[req.session.user_id], message: "This urls does not belong to you", errorCode: "401" };
    return res.status(401).render("urls_error", templateVars);
  } else {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
    return res.render("urls_show", templateVars);
  }
});

//GET /u/:id endpoint - redirects to the longURL associated with short URL ID
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    const templateVars = { user: users[req.session.user_id], message: "That short URL id does not exist", errorCode: "404" };
    return res.status(404).render("urls_error", templateVars);
  } else {
    return res.redirect(longURL);
  }
});

//GET / endpoint - redirects to /urls if logged in - redirects to /login if not logged in
app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});

//GET /urls.json endpoint that parses JSON and resolves to a JavaScript object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//POST /login endpoint - logs in user if email and password exist in the users database
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userInfo = getUserByEmail(email, users);
  // If a user with that e-mail cannot be found, return a response with a 403 status code.
  if (!userInfo) {
    const templateVars = { user: users[req.session.user_id], message: "Email not found", errorCode: "403" };
    return res.status(403).render("urls_error", templateVars);
  } else if (!bcrypt.compareSync(password, userInfo.password)) {
    const templateVars = { user: users[req.session.user_id], message: "Password does not match", errorCode: "403" };
    return res.status(403).render("urls_error", templateVars);
  } else {
    req.session.user_id = userInfo.id;
    return res.redirect("/urls");
  }
});

//POST /logout endpoint - logs user out by deleting userID cookie/session
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


//GET /register endpoint - renders urls_registser view with form to register a new user
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

//POST /register endpoint - if Email doesn't exist in users database and password is entered, creates a new user in the users database
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const templateVars = { user: users[req.session.user_id], message: `Error 400: ${(!email) ? 'Email' : 'Password'} was empty`, errorCode: "400" };
    return res.status(400).render("urls_error", templateVars);
  } else if (getUserByEmail(email, users)) {
    const templateVars = { user: users[req.session.user_id], message: "Email already exists as a user", errorCode: "400" };
    return res.status(400).render("urls_error", templateVars);
  } else {
    const id = generateRandomString();
    const user = {
      id,
      email,
      password: bcrypt.hashSync(password, 10)
    };
    users[id] = user;
    req.session.user_id = id;
    return res.redirect("/urls");
  }
});

//GET /login endpoint which renders urls_login view
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    return res.redirect("/urls");
  } else {
    return res.render("urls_login", templateVars);
  }
});

//Sends message when app is listening on default port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
