const {verify} = require("jsonwebtoken");

const validateToken = (accessToken) => {
    //* Validate AccessToken against Environment Variables
    const validToken = verify(
        accessToken,
        process.env.JWT_SECRET, 
        {
            algorithms: process.env.JWT_ALGORITHM, 
            issuer: process.env.JWT_ISSUER
        });
    return validToken;
};

module.exports = {validateToken};