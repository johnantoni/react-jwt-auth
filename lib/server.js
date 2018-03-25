const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const tokenService = require("./tokenService");
const auth = require("./middleware/authentication");
const PORT = 8080;

const app = express();
app.use(bodyParser.json());

const uri = "mongodb://localhost:27017/auth";
mongoose.connect(uri);

const User = require("./models/user")

app.post("/signup", (req, res) => {
  // get the email and password from the request body
  const { email, password } = req.body;
  // create a new instance of the user model
  const user = new User({
    email,
    password
  });
  // save it
  user
    .save()
    .then(doc => {
      // if successful, send back user
      res.status(200).json({
        message: "success",
        payload: doc
      });
    })
    .catch(err => {
      // if unsuccessful, send back error
      res.status(500).json({ message: err.message });
    });
});

// post to login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).then(user => {
    if (user) {
      user
        // compare a user's hash to the password sent in the HTTP request body
        .comparePassword(password) // we defined that in our user model, which sends a promise
        .then(isMatch => {
          // if they match
          // send back the user
          if (isMatch) {
            // create a new token
            const token = tokenService.create(user);
            res.status(200).json({
              message: "success",
              payload: token // send back the token to the user
            });
          } else {
            res.status(400).json({ message: "unauthorized" });
          }
        })
        // all other errors are 500s!
        .catch(err => {
          res.status(500).json({
            message: err.message
          });
        });
    } else {
      // no user found with the posted email
      res.status(401).json({
        message: "unauthorized"
      });
    }
  });
});

app.get("/user/current", auth, (req, res) => {
  const { id } = req.token.user;
  User.findById(id).then(doc => {
    if (doc) {
      res.status(200).send({
        message: "success",
        payload: doc
      });
    } else {
      res.status(401).send({
        message: "forbidden"
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
