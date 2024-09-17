// AuthMiddleware is the custom validation middleware that uses the JWT token in the frontend to validate requests
// NOTE: There is an issue using this middleware in the current implementation of the app.
// Since the frontend and backend are built from different origins, the backend can not access the JWT token stored in the frontend due to browser privacy settings
// This means that for any backend route request that is not a post request, the middleware will say there is no logged-in user since the backend can not detect the presence of the token
// This led to having to implement frontend validation using jwtDecodify, and is an issue that needs to be addressed by rebuilding the app so that the frontend and backend share the same build origin

// Imports
const {verify} = require("jsonwebtoken")
const router = require("../routes/UserRoutes");

// Middleware validation function applied to route requests
const validateToken = (req, res, next) => {
    // Check to see if there is an existing access token indicating a user has logged in
    const accessToken = req.header("accessToken");
    console.log("Received token:", accessToken);

    if (!accessToken) {
        console.log("No token provided");
        return res.json({error: "User is not logged in"})
    }

    // Check to see if the accessToken is a valid token based off the key
    try {
        const validToken = verify(accessToken, "dafwegaxhsasdasescx");
        console.log("Token verified:", validToken);
        req.user = validToken;
        // Passed control to the route if validation is successful
        return next();
    } catch (error) {
        console.log("Token verification error:", error);
        return res.json({error: error});
    }
}

module.exports = { validateToken };
