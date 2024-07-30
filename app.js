const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");


const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

const registerRoute = require('./routes/register');
const userRoute = require('./routes/user');
const transactionRoute = require('./routes/transaction');


app.use(bodyParser.json());
app.use(cors());


app.use("/register", registerRoute);

app.use("/user", userRoute);
app.use("/transactions", transactionRoute);

// app.use('/uploads', express.static('./uploads'));

module.exports = app;