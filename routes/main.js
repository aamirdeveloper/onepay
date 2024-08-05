const express = require('express');
const mainController = require("../controllers/main.controller");

const router = express.Router();

router.post('/save-contact', mainController.save_contact)

module.exports= router;