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

router.post('/assign-bank-account', adminController.assign_bank_account)
router.post('/users-bank-accounts', adminController.users_bank_accounts)
router.post('/remove-users-bank-account', adminController.remove_users_bank_account)

router.post('/add-crypto-account', adminController.uploadImg, adminController.add_crypto_account);
router.get('/crypto-account-list', adminController.crypto_account_list);
router.post('/delete-crypto-account', adminController.delete_crypto_account);

router.post('/assign-crypto-account', adminController.assign_crypto_account)
router.post('/users-crypto-accounts', adminController.users_crypto_accounts)

router.get('/payment-links', adminController.payment_links);
router.post('/approve-payment-link', adminController.approve_payment_link);

module.exports= router;
