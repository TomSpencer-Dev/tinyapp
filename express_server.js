
const express = require('express');
const { OPEN_READWRITE } = require('sqlite3');
const app = express();
const PORT = 8080; // default port 8080

//Set ejs as the view engine
app.set("view engine", "ejs");

//Database of URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

//Generate a Random Short URL ID
const generateRandomString = function() {
  let shortURL = "";

  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    shortURL += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  console.log("shortURL: " + shortURL);
  return shortURL;
};



app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortURLID = generateRandomString();
  urlDatabase[shortURLID] = req.body.longURL;
console.log(urlDatabase)
  res.redirect(`/urls/${shortURLID}`)
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
