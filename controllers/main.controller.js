const models = require("../models");
const helper = require('../helper');
const Validator = require('fastest-validator');
require('dotenv').config();


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

function payment_link_details(req, res) {
    const post = {
        code: req.body.code
    }

    const schema = {
        code: {type: "string", optional: false, empty: false}
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

    let code = req.body.code;
    
    models.PaymentLink.findOne({where:{paymentCode:code}}).then(result =>{
        if(result === null){
            res.status(200).json({
                status: 0,
                message: "Not found"
            });
        }else{

            let userId = result.userId;
            let paymentType = result.paymentType;
            let currency = result.currency;

            if(paymentType == "Bank Transfer")
            {
                models.UsersBank.findOne({
                    where: {
                        userId: userId
                    },
                }).then(result1 => {

                    models.BankAccount.findOne({
                        where: {
                            id: result1.bankAccountId
                        },
                    }).then(result2 => {
                        
                        var arr = {
                            status: 1, 
                            "message": "login successfull",
                            "paymentType": result.paymentType,
                            "productName": result.productName,
                            "productImage": result.productImage,
                            "price": result.price,
                            "currency": result.currency,
                            "paymentCode": result.paymentCode,
                            "linkStatus": result.linkStatus,
                            "bankName": result2.bankName,
                            "bankAccountNumber": result2.bankAccountNumber,
                            "bankAccountName": result2.bankAccountName,
                        };

                        res.status(200).json(arr);
                    }).catch(error => {
                        res.status(200).json({
                            status: 2,
                            message: "Something went wrong!",
                            error: error
                        });
                    });
                    
                }).catch(error => {
                    res.status(200).json({
                        status: 2,
                        message: "Something went wrong!",
                        error: error
                    });
                });
            }
            else if(paymentType == "Crypto")
            {
                models.CryptoAccount.findOne({
                    where: {
                        currency: currency
                    },
                }).then(result1 => {
                    
                    var arr = {
                        status: 1, 
                        "message": "login successfull",
                        "paymentType": result.paymentType,
                        "productName": result.productName,
                        "productImage": result.productImage,
                        "price": result.price,
                        "currency": result.currency,
                        "paymentCode": result.paymentCode,
                        "linkStatus": result.linkStatus,
                        "walletAddress": result1.walletAddress,
                        "network": result1.network,
                        "QRImage": result1.QRImage,
                    };

                    res.status(200).json(arr);
                }).catch(error => {
                    res.status(200).json({
                        status: 2,
                        message: "Something went wrong!",
                        error: error
                    });
                });
            }
            else {
                res.status(200).json({
                    status: 1,
                    message: "success",
                    data: result
                });
            }
        }
    }).catch(error => {
        res.status(200).json({
            status: 2,
            message: "Something went wrong!",
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
    payment_link_details:payment_link_details
}
