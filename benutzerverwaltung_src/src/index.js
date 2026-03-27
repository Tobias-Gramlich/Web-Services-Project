//* .env Import
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

//* Express Configuration
const express = require('express');
const app = express();
app.use(express.json());

//* Cors Configuration
const cors = require('cors');
app.use(cors());

//* Database Import
const database = require('./models');

//* Routes Configuration
const UserRouter = require('./routes/Users');
app.use("/users", UserRouter);

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Benutzerverwaltung API',
            version: '1.0.0',
        },
    },
    apis: ['./routes/*.js'],   // path to your route files
};

const spec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
app.get('/openapi.json', (req, res) => res.json(spec));  // raw spec endpoint

//* Database Synchronization and API Port Setup
database.sequelize.sync().then(() => {
    app.listen(process.env.BENUTZERVERWALTUNG_PORT || 3001, () => {
        console.log(`-----------------------------------------------------`);
        console.log(`-----User Management Server running on Port ${process.env.BENUTZERVERWALTUNG_PORT}-----`);
        console.log(`-----------------------------------------------------`);
    });
}).catch((error) => {
    console.log(error);
});