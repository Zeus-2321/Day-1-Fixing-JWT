const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs')
const User = require("../models/User");

const router = express.Router();

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
  })
}

router.post("/register", async (req, res) => {
  const { username, password} = req.body;

  if(!username || !password) {
    return res.status(400).json({ message: "Username or password cannot be empty"})
  }

  const user = await User.findOne({ username });

  if (user) {
    return res.status(400).json({ message: "User already exists!" }); 
  }

  const hashPassword = bcrypt.hashSync(password, 10);
  const newUser = await User.create({
      username: username,
      password: hashPassword,
  })

  if(!newUser) {
    return res.status(400).json({ message: "Failed to create the user" }); 
  }

  const result = newUser.toJSON();

  delete result.password;

  result.token = generateToken({
      userId: result._id
  })

    
  return res.status(201).json({
      status: 'success',
      data: result,
  })
});


router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) {
    return res.status(400).json({message: "Username or password cannot be empty"})
  }
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: "User not found" }); 
  }

  if(!(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({message: "Incorrect Email or password!"})
  }

  const token = generateToken({
    userId: user._id
  })
  res.json({ token });
});

module.exports = router;