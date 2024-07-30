const express = require('express');
const transactionController = require("../controllers/transaction.controller");

const router = express.Router();

router.get('/', transactionController.index)
router.post('/send', transactionController.send)

module.exports= router;