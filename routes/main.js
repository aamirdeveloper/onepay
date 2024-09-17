const express = require('express');
const mainController = require("../controllers/main.controller");

const router = express.Router();

router.post('/save-contact', mainController.save_contact)

router.post('/payment-link-details', mainController.payment_link_details)
router.post('/widget-details', mainController.widget_details)

router.post('/save-link-transaction', mainController.uploadImg, mainController.save_link_transaction)
router.post('/link-transaction-status', mainController.link_transaction_status)

router.post('/save-withdraw-request', mainController.save_withdraw_request);
router.post('/withdraw-status-api', mainController.withdraw_status_api);

module.exports= router;
