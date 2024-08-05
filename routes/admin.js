const express = require('express');
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.post('/login', adminController.login)
router.post('/change-password', adminController.change_password)


router.get('/all-transactions', adminController.all_transactions)
router.get('/all-users', adminController.all_users)
router.post('/users-transactions', adminController.users_transactions)

router.get('/contact-requests', adminController.contact_requests)

module.exports= router;