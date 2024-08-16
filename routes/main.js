const express = require('express');
const mainController = require("../controllers/main.controller");

const router = express.Router();

router.post('/save-contact', mainController.save_contact)

router.post('/payment-link-details', mainController.payment_link_details)

module.exports= router;
