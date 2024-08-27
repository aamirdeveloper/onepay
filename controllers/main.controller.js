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
                    if(result1 === null)
                    {
                        res.status(200).json({
                            status: 3,
                            message: "Record not found"
                        });
                    }
                    else
                    {
                        let fees = result1.fees;
                        models.BankAccount.findOne({
                            where: {
                                id: result1.bankAccountId
                            },
                        }).then(result2 => {
                            if(result2 === null)
                            {
                                res.status(200).json({
                                    status: 3,
                                    message: "Record not found"
                                });
                            }
                            else
                            {
                                var arr = {
                                    status: 1, 
                                    "message": "success",
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
                                    "fees": fees,
                                };

                                res.status(200).json(arr);
                            }
                        }).catch(error => {
                            res.status(200).json({
                                status: 2,
                                message: "Something went wrong!",
                                error: error
                            });
                        });
                    }
                    
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
                models.CryptoAccount.findAll({
                    where: {
                        currency: currency
                    },
                }).then(result1 => {
                    if(result1 === null)
                    {
                        res.status(200).json({
                            status: 3,
                            message: "Record not found"
                        });
                    }
                    else
                    {
                        let arr = [];   
                        for (var i = 0; i < result1.length; i++) 
                        {
                            // console.log(result1[i]);
                            arr.push(result1[i].id);
                        }

                        models.usersCryptoAccount.findAll({
                            where: {
                                userId: userId,
                                cryptoAccountId: arr
                            },
                        }).then(result2 => {
                            if(result2 === null)
                            {
                                res.status(200).json({
                                    status: 3,
                                    message: "Record not found"
                                });
                            }
                            else
                            {
                                let selected = 0;
                                let fees = 0;
                                for (var i = 0; i < result2.length; i++) 
                                {
                                    selected = result2[i].cryptoAccountId;
                                    fees = result2[i].fees;
                                }
                                if(selected != 0)
                                {
                                    models.CryptoAccount.findAll({
                                        where: {
                                            id: selected
                                        },
                                    }).then(result3 => {
                                        if(result3 === null)
                                        {
                                            res.status(200).json({
                                                status: 3,
                                                message: "Record not found"
                                            });
                                        }
                                        else
                                        {
                                            var arr = {
                                                status: 1, 
                                                "message": "success",
                                                "paymentType": result.paymentType,
                                                "productName": result.productName,
                                                "productImage": result.productImage,
                                                "price": result.price,
                                                "currency": result.currency,
                                                "paymentCode": result.paymentCode,
                                                "linkStatus": result.linkStatus,
                                                "walletAddress": result3.walletAddress,
                                                "network": result3.network,
                                                "QRImage": result3.QRImage,
                                                "fees": fees,
                                            };
                                            res.status(200).json(arr);
                                        }
                                    });
                                }
                                else
                                {
                                    res.status(200).json({
                                        status: 3,
                                        message: "Record not found"
                                    });
                                }
                            }
                        });
                    }
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

function widget_details(req, res) {
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
    
    models.Widget.findOne({where:{widgetCode:code}}).then(result =>{
        if(result === null){
            res.status(200).json({
                status: 0,
                message: "Not found"
            });
        }else{
            let userId = result.userId;
            let paymentTypes = result.paymentTypes;
            
            let arr = paymentTypes.split(",");
            let data = [];
            for (var i = 0; i < arr.length; i++) 
            {
                let v = arr[i];
                if(v == "BTC" || v == "USDT")
                {
                    models.CryptoAccount.findAll({
                        where: {
                            currency: v
                        },
                    }).then(result1 => {
                        if(result1 === null)
                        {
                            /*res.status(200).json({
                                status: 3,
                                message: "Record not found"
                            });*/
                        }
                        else
                        {
                            let arr = [];   
                            for (var i = 0; i < result1.length; i++) 
                            {
                                // console.log(result1[i]);
                                arr.push(result1[i].id);
                            }

                            models.usersCryptoAccount.findAll({
                                where: {
                                    userId: userId,
                                    cryptoAccountId: arr
                                },
                            }).then(result2 => {
                                if(result2 === null)
                                {
                                    /*res.status(200).json({
                                        status: 3,
                                        message: "Record not found"
                                    });*/
                                }
                                else
                                {
                                    let selected = 0;
                                    let fees = 0;
                                    for (var i = 0; i < result2.length; i++) 
                                    {
                                        selected = result2[i].cryptoAccountId;
                                        fees = result2[i].fees;
                                    }
                                    if(selected != 0)
                                    {
                                        models.CryptoAccount.findAll({
                                            where: {
                                                id: selected
                                            },
                                        }).then(result3 => {
                                            if(result3 === null)
                                            {
                                                /*res.status(200).json({
                                                    status: 3,
                                                    message: "Record not found"
                                                });*/
                                            }
                                            else
                                            {
                                                console.log(result3);
                                                let walletAddress = result3.walletAddress;
                                                let network = result3.network;
                                                let QRImage = result3.QRImage;
                                                
                                                var arr = {
                                                    "websiteDomain": result.websiteDomain,
                                                    "taxId": result.taxId,
                                                    "widgetCode": result.widgetCode,
                                                    "walletAddress": walletAddress,
                                                    "network": network,
                                                    "QRImage": QRImage,
                                                    "fees": fees,
                                                };
                                                console.log(arr);
                                                // res.status(200).json(arr);
                                                data.push(arr);
                                            }
                                        });
                                    }
                                    else
                                    {
                                        res.status(200).json({
                                            status: 3,
                                            message: "Record not found"
                                        });
                                    }
                                }
                            });
                        }
                    }).catch(error => {
                        res.status(200).json({
                            status: 2,
                            message: "Something went wrong!",
                            error: error
                        });
                    });
                }
                else if(v == "BANK TRANSFER")
                {
                    models.UsersBank.findOne({
                        where: {
                            userId: userId
                        },
                    }).then(result1 => {
                        if(result1 === null)
                        {
                            res.status(200).json({
                                status: 3,
                                message: "Record not found"
                            });
                        }
                        else
                        {
                            let fees = result1.fees;
                            models.BankAccount.findOne({
                                where: {
                                    id: result1.bankAccountId
                                },
                            }).then(result2 => {
                                if(result2 === null)
                                {
                                    res.status(200).json({
                                        status: 3,
                                        message: "Record not found"
                                    });
                                }
                                else
                                {
                                    var arr1 = {
                                        status: 1, 
                                        "message": "success",
                                        "websiteDomain": result.websiteDomain,
                                        "taxId": result.taxId,
                                        "widgetCode": result.widgetCode,
                                        "bankName": result2.bankName,
                                        "bankAccountNumber": result2.bankAccountNumber,
                                        "bankAccountName": result2.bankAccountName,
                                        "fees": fees,
                                    };

                                    // res.status(200).json(arr);
                                    data.push(arr1);
                                }
                            }).catch(error => {
                                res.status(200).json({
                                    status: 2,
                                    message: "Something went wrong!",
                                    error: error
                                });
                            });
                        }
                        
                    }).catch(error => {
                        res.status(200).json({
                            status: 2,
                            message: "Something went wrong!",
                            error: error
                        });
                    });
                }
                else
                {
                    var arr2 = {
                        status: 1, 
                        "message": "success",
                        "websiteDomain": result.websiteDomain,
                        "taxId": result.taxId,
                        "widgetCode": result.widgetCode,
                    };
                    
                    data.push(arr2);
                }
            }
            res.status(200).json(data);
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

function save_link_transaction(req, res) {
    const post = {
        paymentCode : req.body.paymentCode,
        status: req.body.status
    }

    const schema = {
        paymentCode: {type: "string", optional: false, empty: false},
        status: {type: "string", optional: false, empty: false},
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

    let paymentCode = req.body.paymentCode;
    let status = req.body.status;
    
    models.PaymentLink.findOne({where:{paymentCode:paymentCode}}).then(result =>{
        if(result === null){
            res.status(200).json({
                status: 0,
                message: "Not found"
            });
        }else{
            let paymentId = result.id;
            models.PaymentLinkTransaction.findOne({where:{paymentId:paymentId}}).then(result =>{
                if(result === null){
                    post.paymentId = paymentId;
                    models.PaymentLinkTransaction.create(post).then(result => {        
                        res.status(200).json({
                            status: 1,
                            message: "Saved successfully",
                            post: result
                        });
                    }).catch(error => {
                        res.status(200).json({
                            status: 2,
                            message: "Something went wrong",
                            error: error
                        });
                    });
                }else{
                    res.status(200).json({
                        status: 3,
                        message: "Already added"
                    });
                }
            }).catch(error => {
                res.status(200).json({
                    status: 2,
                    message: "Something went wrong!",
                    error: error
                });
            });
        }
    }).catch(error => {
        res.status(200).json({
            status: 2,
            message: "Something went wrong!",
            error: error
        });
    });
}

function link_transaction_status(req, res) {
    const post = {
        paymentCode : req.body.paymentCode
    }

    const schema = {
        paymentCode: {type: "string", optional: false, empty: false}
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

    let paymentCode = req.body.paymentCode;
    
    models.PaymentLink.findOne({where:{paymentCode:paymentCode}}).then(result =>{
        if(result === null){
            res.status(200).json({
                status: 0,
                message: "Not found"
            });
        }else{
            let paymentId = result.id;
            models.PaymentLinkTransaction.findOne({where:{paymentId:paymentId}}).then(result =>{
                if(result === null){
                    res.status(200).json({
                        status: 0,
                        message: "Not found"
                    });
                }else{
                    let arr = {
                        id: result.id,
                        paymentId: result.paymentId,
                        status: result.status,
                        accepted: result.accepted
                    };

                    res.status(200).json({
                        status: 1,
                        message: "success",
                        record: arr
                    });
                }
            }).catch(error => {
                res.status(200).json({
                    status: 2,
                    message: "Something went wrong!",
                    error: error
                });
            });
        }
    }).catch(error => {
        res.status(200).json({
            status: 2,
            message: "Something went wrong!",
            error: error
        });
    });
}

module.exports = {
    save_contact: save_contact,
    payment_link_details:payment_link_details,
    widget_details:widget_details,
    save_link_transaction:save_link_transaction,
    link_transaction_status:link_transaction_status
}