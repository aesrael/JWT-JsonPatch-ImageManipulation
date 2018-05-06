let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

let login_details = {
    email: "code@code.com",
    password: "code"
};
let imageUrl = "https://avatars3.githubusercontent.com/u/25791711?s=460&v=4";

describe("Login, create signed token, create thumbnail", () => {
    it("Login, and checks if token is present on authorization header, then create image thumbnail from image url", done => {
        chai
            .request(server)
            .post("/login")
            .send(login_details)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.property("token");
                res.body.should.have.property("patchedDoc");
                let token = res.body.token;

                // follow up with requesting protected page that creates thumbnail
                chai
                    .request(server)
                    .get(`/thumb?url=${imageUrl}`)
                    // we set the auth header with our token
                    .set("Authorization", token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.have.header("content-type");
                        res.header["content-type"].should.be.equal(
                            "image/jpeg"
                        );
                        done();
                    });
            });
    });
});
