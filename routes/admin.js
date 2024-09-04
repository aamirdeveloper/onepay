const express = require('express');
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.post('/login', adminController.login)
router.post('/change-password', adminController.change_password)

router.get('/dashboard', adminController.index)

router.get('/all-transactions', adminController.all_transactions)
router.get('/all-users', adminController.all_users)
router.post('/users-transactions', adminController.users_transactions)
router.post('/user-details', adminController.user_details)
router.post('/add-referral-code', adminController.add_referral_code)

router.get('/contact-requests', adminController.contact_requests)

router.post('/add-bank-account', adminController.add_bank_account)
router.get('/bank-accounts-list', adminController.bank_accounts_list)
router.post('/update-bank-account', adminController.update_bank_account)
router.post('/delete-bank-account', adminController.delete_bank_account)

router.post('/assign-bank-account', adminController.assign_bank_account)
router.post('/users-bank-accounts', adminController.users_bank_accounts)
router.post('/remove-users-bank-account', adminController.remove_users_bank_account)

router.post('/add-crypto-account', adminController.uploadImg, adminController.add_crypto_account);
router.get('/crypto-account-list', adminController.crypto_account_list);
router.post('/delete-crypto-account', adminController.delete_crypto_account);

router.post('/assign-crypto-account', adminController.assign_crypto_account)
router.post('/users-crypto-accounts', adminController.users_crypto_accounts)
router.post('/remove-users-crypto-account', adminController.remove_users_crypto_account)

router.get('/payment-links', adminController.payment_links);
router.post('/approve-payment-link', adminController.approve_payment_link);

router.post('/add-p2p-exchange', adminController.add_p2p_exchange);
router.get('/p2p-exchange-list', adminController.p2p_exchange_list);
router.post('/delete-p2p-exchange', adminController.delete_p2p_exchange);

router.post('/assign-fees', adminController.assign_fees);
router.post('/users-fees', adminController.users_fees);

router.get('/payment-link-transactions', adminController.payment_link_transactions);
router.post('/update-link-transaction-status', adminController.update_link_transaction_status)

router.get('/completed-transaction', adminController.completed_transaction);

router.post('/get-users-deposits', adminController.get_users_deposits);
router.post('/get-users-withdraws', adminController.get_users_withdraws);

module.exports= router;