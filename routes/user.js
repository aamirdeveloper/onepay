const express = require('express');
const userController = require("../controllers/user.controller");
const loginController = require("../controllers/login.controller");

const router = express.Router();

router.post('/login', loginController.login);
router.post('/check-login-status', loginController.check_login_status);
router.get('/get-login-status', loginController.get_login_status);
router.get('/logout', loginController.logout);

router.post('/change-password', loginController.change_password)
/*----------------------------------------------------------*/
router.get('/dashboard', userController.index);

router.post('/add-payment-link', userController.uploadImg, userController.add_payment_link);
router.get('/all-payment-links', userController.all_payment_links);
router.post('/delete-payment-link', userController.delete_payment_link);

router.get('/transaction-deposits', userController.transaction_deposits);
router.post('/save-comment', userController.save_comment);

router.post('/save-withdraw-request', userController.save_withdraw_request);
router.get('/transaction-withdraw', userController.transaction_withdraw);

router.post('/add-widget', userController.add_widget);

router.get('/get-promptpay', userController.get_promptpay);

module.exports= router;
