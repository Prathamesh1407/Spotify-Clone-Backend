const express = require("express");
const router = express.Router();
const app = express();
const User = require("../models/User");
const { getToken } = require("../utils/helper");
const bcrypt = require("bcrypt");
app.use(express.json()); //Incoming all data will be get converted in JSON Format

//This POST route will help to register a user
router.post("/register", async (req, res) => {
  //This code is run when the /register api is called ad a POST request

  //My req.body will be of the format {email, password, firstName, lastName, userName}
  const { email, password, firstName, lastName, userName } = req.body;
  //Step 2 : Does the user with this email exist ? If exist then throw an error

  const user = await User.findOne({ email: email });

  if (user) {
    return res
      .status(403)
      .json({ err: "An user with this Email already exists" });
  }

  //This is valid request means user is new user
  //Step 3: Create a New User in DB
  //Step 3.1 : we do not store passwords in plain text that might be danger to the security of DB
  //xyz -> we convert the plain text passwird to a hash

  const hashedPassword = await bcrypt.hash(password, 10); //It will generate one encrypt text of length 10

  const newUserData = {
    email,
    password: hashedPassword,
    firstName,
    lastName,
    userName,
  };
  const newUser = await User.create(newUserData);

  //Step 4 :  we want to create a token to return to the user
  const token = await getToken(email, newUser);

  //Step 5 Return the result to user
  const userToReturn = { ...newUser.toJSON(), token };

  //delete userToReturn.password
  return res.status(200).json(userToReturn);
});

router.post("/login", async (req, res) => {
  //Step 1: Get email and password sent by user from req.body
  const { email, password } = req.body;
  //Step 2 : Check if a user with given email exists, If not then credentials are invalid
  const user = await User.findOne({ email });
  console.log(user)
  if (!user) {
    return res.status(403).json({ err: "Invalid Credentials" });
  }
  //Step 3: If the user exists,check the password is correct, If Not the credentials are invalid

  //In this we can't directly compare password===user.password coz password is in hashed format and hashed password can't be regenerate as in original form
  //So to deal with this if we maintain some parameters the xyz will always give same hashed sequence using this catch we can solve the problem

  //for that we can use bcrypt.compare() it enabled us to compare plain password with hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log(isPasswordValid)
  if (!isPasswordValid) {
    return res.status(403).json({ err: "Invalid Credentials" });
  }

  //Step 4 : If the credentials are correct , return a token
  const token = await getToken(user.email, user);
  const userToReturn = { ...user.toJSON(), token };

  delete userToReturn.password;
  return res.status(200).json(userToReturn);
});

module.exports = router;
