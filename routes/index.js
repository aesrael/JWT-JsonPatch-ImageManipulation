const express = require("express");
const router = express.Router();

const apiController = require("../controllers/api");

router.get("/", apiController.index);
router.post("/login", apiController.postLogin);

router.get("/thumb", checkAuth, apiController.generateThumbnail);

function checkAuth(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).json({ error: "No credentials sent!" });
    }
    next();
}

module.exports = router;
