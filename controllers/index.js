const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * GET /
 * Home page.
 */

exports.index = (req, res) => {
  // console.log(req.user)
  res.json("welcome to prostus");
};

// exports.dashboard = (req, res) => {
//     //console.log(req.user)
//     res.json(req.user);
// };
exports.dashboard = (req, res) => {
  const token = getToken(req.headers);
  console.log("/auth" + token);
  if (token) {
    const decode = jwt.decode(token, config.secret);
    User.findOne({ name: decode.name }, function(err, user) {
      if (err) {
        res.json(err);
      }
      if (!user) {
        return res.send({ success: false, msg: "Authentication Failed" });
      } else {
        res.json(user);
      }
    });
  } else {
    return res.json({ success: false, msg: "No Token Found" });
  }
};

const getToken = function(headers) {
  if (headers && headers.authorization) {
    return headers.authorization;
  } else {
    return null;
  }
};
