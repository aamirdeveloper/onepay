const models = require("../models");
const helper = require('../helper');
const Validator = require('fastest-validator');
require('dotenv').config();
const fs = require('fs');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
      },
    filename: function (req, file, cb) {
        cb(null, Date.now()+file.originalname);
    }
});
const uploadImg = multer({storage: storage}).single('file');

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
            console.log('aa');
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
                    order: [
                        ['id', 'DESC']
                    ],
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
                                    "imageName": result2.imageName,
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
            else if(paymentType == "Promptpay")
            {
                models.UsersPromptPay.findOne({
                    where: {
                        userId: userId
                    },
                    order: [
                        ['id', 'DESC']
                    ],
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
                        models.PromptPay.findOne({
                            where: {
                                id: result1.promptPayId
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
                                    "promptPayCode": result2.promptPayCode,
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

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

function widget_details(req, res) {
    const post = {
        code: req.body.code,
        paymentType: req.body.paymentType,
        currency: req.body.currency,
    }

    const schema = {
        code: {type: "string", optional: false, empty: false},
        paymentType: {type: "string", optional: false, empty: false},
        currency: {type: "string", optional: false},
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
    let paymentType = req.body.paymentType;
    let currency = req.body.currency;
    
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

            if(paymentType == "Crypto")
            {
                if(inArray(currency, arr))
                {
                    models.CryptoAccount.findAll({
                        where: {
                            currency: currency
                        },
                    }).then(result1 => {
                        if(result1 !== null)
                        {
                            let nArr = [];
                            for (var i = 0; i < result1.length; i++) 
                            {
                                let crypId = result1[i].id;
                                nArr.push(crypId);
                            }
                            // console.log(nArr);

                            models.usersCryptoAccount.findOne({
                                where: {
                                    userId: userId,
                                    cryptoAccountId: nArr
                                },
                                order: [
                                    ['id', 'DESC']
                                ],
                            }).then(result2 => {
                                if(result2 === null)
                                {
                                    res.status(200).json({
                                        status: 4,
                                        message: "Record not found"
                                    });
                                }
                                else
                                {
                                    console.log(result2);
                                    let selected = result2.cryptoAccountId;
                                    let fees = result2.fees;
                                    /*for (var i = 0; i < result2.length; i++) 
                                    {
                                        selected = result2[i].cryptoAccountId;
                                        fees = result2[i].fees;
                                    }*/
                                    if(selected != 0)
                                    {
                                        models.CryptoAccount.findOne({
                                            where: {
                                                id: selected
                                            },
                                        }).then(result3 => {
                                            if(result3 === null)
                                            {
                                                //
                                            }
                                            else
                                            {
                                                console.log(result3);
                                                let walletAddress = result3.walletAddress;
                                                let network = result3.network;
                                                let QRImage = result3.QRImage;
                                                
                                                var arr1 = {
                                                    status: 1,
                                                    message: "success",
                                                    "websiteDomain": result.websiteDomain,
                                                    "taxId": result.taxId,
                                                    "widgetCode": result.widgetCode,
                                                    "walletAddress": walletAddress,
                                                    "network": network,
                                                    "QRImage": QRImage,
                                                    "fees": fees,
                                                };

                                                res.status(200).json(arr1);
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
                        //
                    });
                }
                else
                {
                    res.status(200).json({
                        status: 4,
                        message: "No result"
                    });

                }
            }
            else if(paymentType == "Bank Transfer")
            {
                if(inArray("BANK TRANSFER", arr))
                {
                    models.UsersBank.findOne({
                        where: {
                            userId: userId
                        },
                        order: [
                            ['id', 'DESC']
                        ],
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
                                        "imageName": result2.imageName,
                                        "fees": fees,
                                    };

                                    res.status(200).json(arr1);
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
                    res.status(200).json({
                        status: 4,
                        message: "No result"
                    });
                }
            }
            else if(paymentType == "PROMTPAY")
            {
                if(inArray("PROMTPAY", arr))
                {
                    models.UsersPromptPay.findOne({
                        where: {
                            userId: userId
                        },
                        order: [
                            ['id', 'DESC']
                        ],
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
                            models.PromptPay.findOne({
                                where: {
                                    id: result1.promptPayId
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
                                        "promptPayCode": result2.promptPayCode,
                                        "fees": fees,
                                    };

                                    res.status(200).json(arr1);
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
                    res.status(200).json({
                        status: 4,
                        message: "No result"
                    });
                }
            }
            else
            {
                res.status(200).json({
                    status: 3,
                    message: "Wrong paymentType"
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

const crypto_details = async function(curr) {
    models.CryptoAccount.findAll({
        where: {
            currency: curr
        },
    }).then(result1 => {
        return result1;
    }).catch(error => {
        return null;
    });
}

function get_user_crypto_accounts(userId, id) {
    models.usersCryptoAccount.findOne({
        where: {
            userId: userId,
            cryptoAccountId: id
        },
    }).then(result2 => {
        if(result2 === null)
        {
            /*res.status(200).json({
                status: 3,
                message: "Record not found"
            });*/
            return null;
        }
        else
        {
            return result2;
            /*let selected = 0;
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
                        //
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
            }*/
        }
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

    let paymentSlip = '';
    if(req.hasOwnProperty('file'))
    {
        paymentSlip = req.file.filename;
    }

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
                    post.paymentSlip = paymentSlip;
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

function save_withdraw_request(req, res) {
    let resp = helper.check_key(req);
    if(resp !== "Successfully Verified")
    {
        // console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        let userId = 41;

        const post1 = {
            withdrawType: req.body.withdrawType,
            withdrawMethod: req.body.withdrawMethod
        }

        const schema = {
            withdrawType: {type: "string", optional: false, empty: false},
            withdrawMethod: {type: "string", optional: false, empty: false}
        }

        const v = new Validator();
        const validationResponse = v.validate(post1, schema);

        if(validationResponse !== true){
            return res.status(200).json({
                status: 0,
                message: "validation failed",
                errors: validationResponse
            });
        }

        let amount = 0;
        let bankName = "";
        let bankAccountNumber = "";
        let bankAccountName = "";
        let currency = "";
        let timePeriod = "";
        let network = "";
        let walletAddress = "";

        if(!req.body.amount)
        {
        }
        else
            amount = req.body.amount;

        if(!req.body.bankName)
        {
        }
        else
            bankName = req.body.bankName;

        if(!req.body.bankAccountNumber)
        {
        }
        else
            bankAccountNumber = req.body.bankAccountNumber;

        if(!req.body.bankAccountName)
        {
        }
        else
            bankAccountName = req.body.bankAccountName;

        if(!req.body.currency)
        {
        }
        else
            currency = req.body.currency;

        if(!req.body.timePeriod)
        {
        }
        else
            timePeriod = req.body.timePeriod;

        if(!req.body.network)
        {
        }
        else
            network = req.body.network;

        if(!req.body.walletAddress)
        {
        }
        else
            walletAddress = req.body.walletAddress;
        
        let post = {
            userId:userId,
            withdrawType: req.body.withdrawType,
            withdrawMethod: req.body.withdrawMethod,
            amount: amount,
            bankName: bankName,
            bankAccountNumber: bankAccountNumber,
            bankAccountName: bankAccountName,
            currency: currency,
            timePeriod: timePeriod,
            network: network,
            walletAddress: walletAddress
        }
        
        models.WithdrawRequest.create(post).then(result => {
            res.status(200).json({
                status: 1,
                message: "added successfully",
                post: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong save",
                error: error
            });
        });
    }
}

function withdraw_status_api(req, res) {
    let resp = helper.check_key(req);
    if(resp !== "Successfully Verified")
    {
        // console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        let userId = 41;

        const post1 = {
            withdrawId: req.body.withdrawId
        }

        const schema = {
            withdrawId: {type: "string", optional: false, empty: false}
        }

        const v = new Validator();
        const validationResponse = v.validate(post1, schema);

        if(validationResponse !== true){
            return res.status(200).json({
                apiRequestStatus: 0,
                message: "validation failed",
                errors: validationResponse
            });
        }

        let withdrawId = post1.withdrawId;

        models.WithdrawRequest.findOne({
            where: {
                id: withdrawId
            }
        }).then(result => {

            if(result === null)
            {
                res.status(200).json({
                    apiRequestStatus: 3,
                    "message": "Withdraw Request not found"
                });
            }
            else
            {
                res.status(200).json({
                    apiRequestStatus: 1,
                    message: "success",
                    status: result.withdrawStatus,
                });
            }
            
        }).catch(error => {
            res.status(200).json({
                apiRequestStatus: 2,
                message: "Something went wrong save",
                error: error
            });
        });
    }
}

function test_api(req, res) {
    const post = {
        code: req.body.code,
        paymentType: req.body.paymentType,
        currency: req.body.currency,
    }

    const schema = {
        code: {type: "string", optional: false, empty: false},
        paymentType: {type: "string", optional: false, empty: false},
        currency: {type: "string", optional: false},
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
            let curr = 'BTC';

            /*one( (data1, curr) => {
                console.log(data1);
                let id = 4;
                two( (data2, userId, id) => {
                    console.log(data2);
                    res.status(200).json({
                        r1: data1,
                        r2: data2
                    });
                });
            });*/

            res.status(200).json({
                status: 0,
                message: "Not found"
            });
        }
    });
}

/*function one(callback, currency) {
    models.CryptoAccount.findAll({
        where: {
            currency: currency
        },
    }).then(result1 => {
        callback(result1);
    });
    // db.query("SQL",(result) => {
   
    // });
}

function two(callback, userId, id) {
    models.usersCryptoAccount.findOne({
        where: {
            userId: userId,
            cryptoAccountId: id
        },
    }).then(result2 => {
        callback(result2);
    });
    // db.query("SQL",(result) => {
    //     callback(result);
    // });
}*/

module.exports = {
    save_contact: save_contact,
    payment_link_details:payment_link_details,
    widget_details:widget_details,
    save_link_transaction:save_link_transaction,
    uploadImg:uploadImg,
    link_transaction_status:link_transaction_status,
    save_withdraw_request:save_withdraw_request,
    withdraw_status_api:withdraw_status_api,
    test_api:test_api
}
