const express = require('express');
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.post('/login', adminController.login)
router.post('/change-password', adminController.change_password)

router.get('/dashboard', adminController.index)

router.get('/all-transactions', adminController.all_transactions)
router.get('/all-users', adminController.all_users)
router.post('/users-transactions', adminController.users_transactions)

router.get('/contact-requests', adminController.contact_requests)

router.post('/add-bank-account', adminController.add_bank_account)
router.get('/bank-accounts-list', adminController.bank_accounts_list)

module.exports= router;
