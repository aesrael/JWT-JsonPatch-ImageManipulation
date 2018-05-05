const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require("multer");
const jwt = require("jsonwebtoken");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    var originalName = file.originalname;
    var extension = originalName.split(".");
    filename =
      originalName + Date.now() + "." + extension[extension.length - 1];
    cb(null, filename);
  }
});

function fileFilter(req, file, cb) {
  var type = file.mimetype;
  var typeArray = type.split("/");
  if (typeArray[0] == "image" || "video" || "application") {
    cb(null, true);
  } else {
    cb(null, false);
  }
}
var upload = multer({
  storage: storage,
  dest: "uploads/",
  fileFilter: fileFilter
});

const apiController = require("../controllers/api");
const indexController = require("../controllers/index");

router.get("/", indexController.index);

router.get("/login", apiController.getLogin);
router.post("/login", apiController.postLogin);
// router.post("/public/login", apiController.postPublicLogin);
router.get("/register", apiController.getSignup);
router.post("/register", apiController.postSignup);

router.get("/thumb", apiController.generateThumbnail);
// router.get(
//   "/profile",
//   passport.authenticate("jwt", { session: false }),
//   apiController.getProfile
// );

module.exports = router;
