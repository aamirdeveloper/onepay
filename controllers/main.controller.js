const models = require("../models");
const helper = require('../helper');
const Validator = require('fastest-validator');
require('dotenv').config();

//Signup function
function save_contact(req, res){
    const post = {
        name: req.body.name,
        email: req.body.email,
        telegramAccount: req.body.telegramAccount
    }

    const schema = {
        name: {type: "string", optional: false, empty: false},
        email: {type: "string", optional: false, empty: false},
        telegramAccount: {type: "string", optional: false},
    }

    const v = new Validator();
    const validationResponse = v.validate(post, schema);

    if(validationResponse !== true){
        return res.status(200).json({
            status: 0,
            message: "validation failed",
            errors: validationResponse
        });
    }
    
    models.ContactRequest.create(post).then(result => {
        
        res.status(200).json({
            status: 1,
            message: "Saved successfully",
            post: result,
        });
    }).catch(error => {
        res.status(200).json({
            status: 2,
            message: "Something went wrong",
            error: error
        });
    });
}

function generateCode() {
    var length = 12,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

module.exports = {
    save_contact: save_contact,
}