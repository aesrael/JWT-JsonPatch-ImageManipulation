const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const bluebird = require("bluebird");
const crypto = bluebird.promisifyAll(require("crypto"));
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const jsonpatch = require("jsonpatch");
const request = require("request");
const jimp = require("jimp");
const passportConfig = require("../config/passport.js");

const User = require("../models/User");

/**
 * Get /logn
 * Get login view
 */
exports.getLogin = (req, res) => {
  res.render("login");
};

/**
 * Get /register
 * Get register view
 */
exports.getSignup = (req, res) => {
  res.render("register");
};

/**
 * POST /register
 * Sign up using email and password.
 */
exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  const newUser = new User({
    password,
    email
  });
  User.findOne(
    {
      email: req.body.email
    },
    (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        return res.redirect("/register");
      }
      newUser.save(err => {
        if (err) {
          return next(err);
        }
        res.redirect("/login");
      });
    }
  );
};

/**
 * POST /login
 * Sign in using email and password.
 */

exports.postLogin = (req, res, next) => {
  // const token = req.headers.authorization || "";
  // console.log(token,'token here');

  const email = req.body.email;
  const password = req.body.password;
  const user = req.body;
  const response = {};
  const token = (response.token = jwt.sign(user, config.secret, {
    expiresIn: 604800
  }));

  if (!token || token == undefined) {
    return res.status(401).json("request rejected");
  }

  req.headers.authorization = `JWT ${token}`;
  console.log(req.headers.authorization);

  thepatch = [
    { op: "replace", path: "/email", value: "israeladura@gmail.com" }
  ];

  patchedDoc = jsonpatch.apply_patch(user, thepatch);

  return res.json({ token, patchedDoc });
};

/**
 * GET /image
 * Generate thumbanil from image url
 */
exports.generateThumbnail = (req, res, next) => {
  let url = req.query.url;
  const filename = returnPath(url);
  const fileStream = fs.createWriteStream(`images/${filename}`);

  console.log(filename);
  //download image by piping url streams into new file
  request
    .get(url)
    .on("error", err => {
      if (err) return next(err);
      console.log(err);
    })
    .pipe(fileStream);

  //resize image
  jimp.read(`images/${filename}`, (err, image) => {
    if (err) return next(err);
    image
      .resize(50, 50) // resize to 50 by 50 pixels
      .write(`uploads/${filename}_50x50`); // save image
  });
  return res.sendFile(`uploads/${filename}_50x50`);
};

/*********HELPERS*********/

/**
 *return filename from a url
 * @param {*} url to return path of
 */

const returnPath = url => {
  return url.substring(url.lastIndexOf("/") + 1);
};

// exports.getProfile = (req, res) => {
//   res.json({ user: req.user });
// };
