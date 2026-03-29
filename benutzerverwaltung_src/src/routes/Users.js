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

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and sends an activation code via email.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: maxmustermann
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePassword123!
 *               email:
 *                 type: string
 *                 format: email
 *                 example: max@example.com
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing or invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Missing Username
 *       409:
 *         description: Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', async (req, res) => {
    //* Deconstruct Body
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    //* Errorchecks
    //* Check if each Component is available
    if (!username) return res.status(400).json({success: false, error: "Missing Username"});
    if (!password) return res.status(400).json({success: false, error: "Missing Password"});
    if (!email) return res.status(400).json({success: false, error: "Missing EMail"});

    //* Check if each Component has a valid format
    const userNameResponse = validateUsername(username);
    if (!userNameResponse.success) {
        return res.status(400).json(userNameResponse);
    };

    const passwordResponse = validatePassword(password);
    if (!passwordResponse.success) {
        return res.status(400).json(passwordResponse);
    };

    const emailResponse = validateEmail(email);
    if (!emailResponse.success) {
        return res.status(400).json(emailResponse);
    };

    //* Check if User or EMail already exist in database
    if(await Users.findOne({where: {username: username}})) return res.status(409).json({success: false, error: "User already exists"});
    if(await Users.findOne({where: {email: email}})) return res.status(409).json({success: false, error: "There is already a user with this EMail"});
    
    //* Create Database Entry
    //* Create a random activation Code
    const activationcode = Math.floor(100000 + Math.random() * 900000);

    //* Hash Password and create new User
    const hash = await bcrypt.hash(password, 10);
    await Users.create({username: username, password: hash, email: email, activationcode: activationcode});

    //* Send Verification EMail
    /*await sendMail({
        to: email,
        subject: "Benutzerverwaltung Verification", 
        text: `Guten Tag ${username}! Hier ihr Aktivierungscode: ${activationcode}`
    });*/

    //* Return Success
    return res.json({success: true, activationcode: activationcode});
});

/**
 * @swagger
 * /users/send_email:
 *   post:
 *     summary: Resend activation email
 *     description: Sends the activation code again to a user whose account is not yet activated.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: maxmustermann
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePassword123!
 *     responses:
 *       200:
 *         description: Activation email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Missing Username
 *       401:
 *         description: Wrong password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Wrong password
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User doesnt exist
 *       409:
 *         description: Account is already activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Account already activated
 *       500:
 *         description: Internal server error
 */
router.post('/send_email', async (req, res) => {
    //* Deconstruct Body
    const username = req.body.username;
    const password = req.body.password;

    //* Errorchecks
    //* Check if each Component is available
    if (!username) return res.status(400).json({success: false, error: "Missing Username"});
    if (!password) return res.status(400).json({success: false, error: "Missing Password"});

    //* Find User
    const user = await Users.findOne({where: {username: username}});

    //* Check if User exists and if Account is activated
    if(!user) return res.status(404).json({success: false, error: "User doesnt exist"});
    if(user.activationcode === 1) return res.status(409).json({success: false, error: "Account already activated"});

    //* Compare submitted Password to User Password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({success: false, error: "Wrong password"});

    //* Send Verification EMail
    /*await sendMail({
        to: user.email,
        subject: "Benutzerverwaltung Verification", 
        text: `Guten Tag ${user.username}! Hier ihr Aktivierungscode: ${user.activationcode}`
    });*/

    //* Return Success
    return res.json({success: true, activationcode: user.activationcode});
});

/**
 * @swagger
 * /users/activate:
 *   post:
 *     summary: Activate a user account
 *     description: Activates a user account using the username and activation code.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - activationcode
 *             properties:
 *               username:
 *                 type: string
 *                 example: maxmustermann
 *               activationcode:
 *                 type: integer
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Account activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing input data or wrong activation code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Wrong Activationcode
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User doesn't exist
 *       500:
 *         description: Internal server error
 */
router.post('/activate', async (req,res) => {
    //* Deconstruct Body
    const username = req.body.username;
    const activationcode = req.body.activationcode;

    //* Check if each Component is available
    if (!username) return res.status(400).json({success: false, error: "Missing Username"});
    if (!activationcode) return res.status(400).json({success: false, error: "Missing Activation Code"});

    //* Search for User and check if it exists
    const user = await Users.findOne({ where: {username: username}});
    if (!user) return res.status(404).json({success: false, error: "User doesn't exist"});

    //* Check if ActivationCode is right and change it to 1
    if (user.activationcode !== activationcode) return res.status(400).json({success: false, error: "Wrong Activationcode"});
    await Users.update({activationcode: 1}, {where: {username: username}});

    //* Return Success
    return res.json({success: true});
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in a user
 *     description: Verifies username and password and returns an access token on success.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: maxmustermann
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Missing input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Missing Username
 *       401:
 *         description: Wrong password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Wrong password
 *       403:
 *         description: Account is not activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Account is not activated
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User doesn't exist
 *       500:
 *         description: Internal server error
 */
router.post('/login', async (req, res) => {
    //* Deconstruct Body
    const username = req.body.username;
    const password = req.body.password;

    //* Check if each Component is available
    if (!username) return res.status(400).json({success: false, error: "Missing Username"});
    if (!password) return res.status(400).json({success: false, error: "Missing Password"});

    //* Search for User and check if it exists
    const user = await Users.findOne({ where: {username: username}});
    if (!user) return res.status(404).json({success: false, error: "User doesn't exist"});

    //* Check if User is activated
    if (user.activationcode !== 1) return res.status(403).json({success: false, error: "Account is not activated"});

    //* Compare submitted Password to User Password
    const match = await bcrypt.compare(password, user.password);
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

/**
 * @swagger
 * /users/auth:
 *   post:
 *     summary: Validate an access token
 *     description: Validates an access token and returns the user data stored in it.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 username:
 *                   type: string
 *                   example: maxmustermann
 *                 userId:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: max@example.com
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User not authenticated
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /users/change_Username:
 *   put:
 *     summary: Change username
 *     description: Changes the username of the currently authenticated user.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *               - newName
 *             properties:
 *               accessToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               newName:
 *                 type: string
 *                 example: newusername
 *     responses:
 *       200:
 *         description: Username changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing or invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Missing New Name
 *       401:
 *         description: User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User not authenticated
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User not found
 *       409:
 *         description: Username already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User already exists
 *       500:
 *         description: Internal server error
 */
router.put('/change_Username', async (req, res) => {
    //* Deconstruct Body
    const accessToken = req.body.accessToken;
    const newName = req.body.newName;

    //* Check if each Component is available
    if(!accessToken) return res.status(401).json({success: false, error: "Missing AccessToken"});
    if(!newName) return res.status(400).json({success: false, error: "Missing New Name"});

    //* Validate AccessToken
    const validToken = validateToken(accessToken);
    if (!validToken) return res.status(401).json({success: false, error: "User not authenticated"});

    //* Check if Username has a valid format
    const userNameResponse = validateUsername(newName);
    if (!userNameResponse.success) return res.status(400).json(userNameResponse);

    //* Check if User with new name already exists
    if(await Users.findOne({where: {username: newName}})) return res.status(409).json({success: false, error: "User already exists"});
    
    //* Search for User and check if it exists
    const user = await Users.findOne({where: {id: validToken.id}});
    if (!user) return res.status(404).json({success: false, error: "User not found" });

    //* Update Username
    await Users.update({username: newName}, {where: {id: validToken.id}});

    //* Return Success
    return res.json({success: true});
});

/**
 * @swagger
 * /users/change_Password:
 *   put:
 *     summary: Change password
 *     description: Changes the password of the currently authenticated user.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *               - newPassword
 *             properties:
 *               accessToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: MyNewSecurePassword123!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing or invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Missing New Password
 *       401:
 *         description: User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User not authenticated
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/change_Password', async (req, res) => {
    //* Deconstruct Body
    const accessToken = req.body.accessToken;
    const newPassword = req.body.newPassword;

    //* Check if each Component is available
    if(!accessToken) return res.status(401).json({success: false, error: "Missing AccessToken"});
    if(!newPassword) return res.status(400).json({success: false, error: "Missing New Password"});

    //* Validate AccessToken
    const validToken = validateToken(accessToken);
    if (!validToken) return res.status(401).json({success: false, error: "User not authenticated"});

    //* Check if Password has a valid format
    const passwordResponse = validatePassword(newPassword);
    if (!passwordResponse.success) return res.status(400).json(passwordResponse);

    //* Search for User and check if it exists
    const user = await Users.findOne({where: {id: validToken.id}});
    if (!user) return res.status(404).json({success: false, error: "User not found" });

    //* Hash and update Password 
    const hash = await bcrypt.hash(newPassword, 10);
    await Users.update({password: hash}, {where: {id: validToken.id}});

    //* Return Success
    return res.json({success: true});
});

/**
 * @swagger
 * /users/delete_Account:
 *   delete:
 *     summary: Delete account
 *     description: Permanently deletes the account of the currently authenticated user.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User not authenticated!
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 */
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
    if (!user) return res.status(404).json({success: false, error: "User not found" });

    //* Delete User
    await Users.destroy({where: {id: validToken.id}});

    //* Return Success
    return res.json({success: true});
});

module.exports = router;