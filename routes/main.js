const express = require('express');
const mainController = require("../controllers/main.controller");

const router = express.Router();

router.post('/save-contact', mainController.save_contact)

router.post('/payment-link-details', mainController.payment_link_details)
router.post('/widget-details', mainController.widget_details)

router.post('/save-link-transaction', mainController.save_link_transaction)
router.post('/link-transaction-status', mainController.link_transaction_status)

module.exports= router;