//* Import Modules
const express = require('express');
const router = express.Router();
const {Users} = require('../models');
const bcrypt = require("bcryptjs");
const {sign} = require("jsonwebtoken");

//* Import Utils
const {validateUsername} = require("../utils/Inputvalidation/validateUsername");
const {validatePassword} = require("../utils/Inputvalidation/validatePassword");
const {validateEmail} = require("../utils/Inputvalidation/validateEmail");
const {validateToken} = require("../utils/validateToken");
const {sendMail} = require("../utils/mailer");

//* Post Endpoints
//* Register a User to the Database 
//* {username: string, password: string, email: string}
router.post('/register', async (req, res) => {
    //* Deconstruct Body
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    //* Errorchecks
    //* Check if each Component is available
    if (!username) return res.status(409).json({success: false, error: "Missing Username"});
    if (!password) return res.status(409).json({success: false, error: "Missing Password"});
    if (!email) return res.status(409).json({success: false, error: "Missing EMail"});

    //* Check if each Component has a valid format
    const userNameResponse = validateUsername(username);
    if (!userNameResponse.success) {
        return res.status(409).json(userNameResponse);
    };

    const passwordResponse = validatePassword(password);
    if (!passwordResponse.success) {
        return res.status(409).json(passwordResponse);
    };

    const emailResponse = validateEmail(email);
    if (!emailResponse.success) {
        return res.status(409).json(emailResponse);
    };

    //* Check if User or EMail already exist in database
    if(await Users.findOne({where: {username: username}})) return res.status(409).json({success: false, error: "User already exists"});
    if(await Users.findOne({where: {email: email}})) return res.status(409).json({success: false, error: "There is already a user with this EMail"});
    
    //* Create Database Entry
    //* Create a random activation Code
    const activationcode = Math.floor(100000 + Math.random() * 900000);

    //* Hash Password and create new User
    bcrypt.hash(password, 10).then((hash)=>{
        Users.create({username: username, password: hash, email: email, activationcode: activationcode});
    });

    //* Send Verification EMail
    await sendMail({
        to: email,
        subject: "Benutzerverwaltung Verification", 
        text: `Guten Tag ${username}! Hier ihr Aktivierungscode: ${activationcode}`
    });

    //* Return Success
    return res.json({success: true});
});

//* Send Activation Code again
//* {username: string, password: string}
router.post('/send_email', async (req, res) => {
    //* Deconstruct Body
    const username = req.body.username;
    const password = req.body.password;

    //* Errorchecks
    //* Check if each Component is available
    if (!username) return res.status(409).json({success: false, error: "Missing Username"});
    if (!password) return res.status(409).json({success: false, error: "Missing Password"});

    //* Find User
    const User = await Users.findOne({where: {username: username}});

    //* Check if User exists and if Account is activated
    if(!User) return res.status(409).json({success: false, error: "User doesnt exist"});
    if(User.activationcode === 1) return res.status(409).json({success: false, error: "Account already activated"});

    //* Send Verification EMail
    await sendMail({
        to: User.email,
        subject: "Benutzerverwaltung Verification", 
        text: `Guten Tag ${User.username}! Hier ihr Aktivierungscode: ${User.activationcode}`
    });

    //* Return Success
    return res.json({success: true});
});

//* Activate Account with Activation Code
//* {username: string, activationcode: int}
router.post('/activate', async (req,res) => {
    //* Deconstruct Body
    const username = req.body.username;
    const activationcode = req.body.activationcode;

    //* Check if each Component is available
    if (!username) return res.status(409).json({success: false, error: "Missing Username"});
    if (!activationcode) return res.status(409).json({success: false, error: "Missing Activation Code"});

    //* Search for User and check if it exists
    const user = await Users.findOne({ where: {username: username}});
    if (!user) return res.status(409).json({success: false, error: "User doesn't exist"});

    //* Check if ActivationCode is right and change it to 1
    if (user.activationcode !== activationcode) return res.status(409).json({success: false, error: "Wrong Activationcode"});
    await Users.update({activationcode: 1}, {where: {username: username}});

    //* Return Success
    return res.json({success: true});
});

//* Log a User in and send them an Authentication Token
//* {username: string, password: string}
router.post('/login', async (req, res) => {
    //* Deconstruct Body
    const username = req.body.username;
    const password = req.body.password;

    //* Check if each Component is available
    if (!username) return res.status(409).json({success: false, error: "Missing Username"});
    if (!password) return res.status(409).json({success: false, error: "Missing Password"});

    //* Search for User and check if it exists
    const user = await Users.findOne({ where: {username: username}});
    if (!user) return res.status(409).json({success: false, error: "User doesn't exist"});

    //* Check if User is activated
    if (user.activationcode !== 1) return res.status(409).json({success: false, error: "Account is not activated"});

    //* Compare submitted Password to User Password
    bcrypt.compare(password, user.password).then((match) => {
        if (!match) return res.status(401).json({success: false, error: "Wrong password"});

        //* Create an Access Token
        const accessToken = sign(
            {
                username: user.username, 
                id: user.id, 
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE,
                issuer: process.env.JWT_ISSUER,
                algorithm: process.env.JWT_ALGORITHM
            }
        );

        //* Return AccessToken and Success
        return res.json({success: true, accessToken: accessToken});
    });
});

//* Check if User is authenticated based on the Authentication Token
//* {accessToken: string}
router.post('/auth', async (req, res) => {
    //* Get AccessToken from Body
    const accessToken = req.body.accessToken;

    //* Check if each Component is available
    if(!accessToken) return res.status(401).json({success: false, error: "Missing AccessToken"});

    //* Validate AccessToken
    const validToken = validateToken(accessToken);
    if (!validToken) return res.status(401).json({success: false, error: "User not authenticated"});
    
    //* Return Username, UserId and Success
    return res.json({success: true, username: validToken.username, userId: validToken.id, email: validToken.email});
});

//* Put Endpoints
//* Allow User to change their Username
//* {accessToken: string, newName: string}
router.put('/change_Username', async (req, res) => {
    //* Deconstruct Body
    const accessToken = req.body.accessToken;
    const newName = req.body.newName;

    //* Check if each Component is available
    if(!accessToken) return res.status(401).json({success: false, error: "Missing AccessToken"});
    if(!newName) return res.status(401).json({success: false, error: "Missing New Name"});

    //* Validate AccessToken
    const validToken = validateToken(accessToken);
    if (!validToken) return res.status(401).json({success: false, error: "User not authenticated"});

    //* Check if Username has a valid format
    const userNameResponse = validateUsername(newName);
    if (!userNameResponse.success) {
        return res.status(409).json(userNameResponse);
    };

    //* Check if User with new name already exists
    if(await Users.findOne({where: {username: newName}})) return res.status(409).json({success: false, error: "User already exists"});
    
    //* Search for User and check if it exists
    const user = await Users.findOne({where: {id: validToken.id}});
    if (!user) {res.status(404).json({success: false, error: "User not found" });}

    //* Update Username
    await Users.update({username: newName}, {where: {id: validToken.id}});

    //* Return Success
    return res.json({success: true});
});

//* Allow User to change their Password
//* {accessToken: string, newPassword: string}
router.put('/change_Password', async (req, res) => {
    //* Deconstruct Body
    const accessToken = req.body.accessToken;
    const newPassword = req.body.newPassword;

    //* Check if each Component is available
    if(!accessToken) return res.status(401).json({success: false, error: "Missing AccessToken"});
    if(!newPassword) return res.status(401).json({success: false, error: "Missing New Password"});

    //* Validate AccessToken
    const validToken = validateToken(accessToken);
    if (!validToken) return res.status(401).json({success: false, error: "User not authenticated"});

    //* Check if Password has a valid format
    const passwordResponse = validatePassword(newPassword);
    if (!passwordResponse.success) {
        return res.status(409).json(passwordResponse);
    };

    //* Search for User and check if it exists
    const user = await Users.findOne({where: {id: validToken.id}});
    if (!user) {res.status(404).json({success: false, error: "User not found" });}

    //* Hash and update Password 
    bcrypt.hash(newPassword, 10).then((hash)=>{
        Users.update({password: hash}, {where: {id: validToken.id}});
    });

    //* Return Success
    return res.json({success: true});
});

//* Delete Endpoints
//* Allow User to delete Account
//* {accessToken: string}
router.delete('/delete_Account', async (req, res) => {
    //* Deconstruct Body
    const accessToken = req.body.accessToken;

    //* Check if each Component is available
    if(!accessToken) return res.status(401).json({success: false, error: "User not authenticated!"});

    //* Validate AccessToken
    const validToken = validateToken(accessToken);
    if (!validToken) return res.status(401).json({success: false, error: "User not authenticated!"});

    //* Search for User and check if it exists
    const user = await Users.findOne({where: {id: validToken.id}});
    if (!user) {res.status(404).json({success: false, error: "User not found" });}

    //* Delete User
    Users.destroy({where: {id: validToken.id}});

    //* Return Success
    return res.json({success: true});
});

module.exports = router;