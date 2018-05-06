const fs = require("fs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const jsonpatch = require("jsonpatch");
const request = require("request");
const jimp = require("jimp");
const path = require("path");

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res) => {
    const user = req.body;
    const response = {};
    const token = (response.token = jwt.sign(user, config.secret, {
        expiresIn: 604800
    }));
    if (!token) {
        return res.status(403).json({ error: "Invalid request!" });
    }
    let thepatch = [
        { op: "replace", path: "/email", value: "israeladura@gmail.com" }
    ];

    let patchedDoc = jsonpatch.apply_patch(user, thepatch);

    return res.json({ token, patchedDoc });
};

/**
 * GET /image
 * Generate thumbanil from image url
 */
exports.generateThumbnail = (req, res, next) => {
    let url = req.query.url;
    const filename = `${returnPath(url)}.jpg`;
    const fileStream = fs.createWriteStream(`images/${filename}`);

    //download image by piping url streams into new file
    request
        .get(url)
        .on("error", err => {
            if (err) return next(err);
        })
        .pipe(fileStream);
    //console.log(typeof fileStream, "type");
    fileStream.on("finish", () => {
        jimp.read(`images/${filename}`, (err, image) => {
            if (err) throw err;
            image
                .resize(50, 50) // resize to 50 by 50 pixels
                .write(`images/50x50${filename}`); // save image
        });
        res.sendFile(path.join(__dirname, "../images/", `50x50${filename}`));
    });
};

/*********HELPERS*********/

/**
 *return filename from a url
 * @param {*} url to return path of
 */

const returnPath = url => {
    return url.substring(url.lastIndexOf("/") + 1);
};
