const Validator = require('fastest-validator');
const models = require('../models');
const jwt = require('jsonwebtoken'); 
const helper = require('../helper');
const bycryptjs = require("bcryptjs");
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
const uploadImg = multer({storage: storage}).single('image');

function index(req, res){
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        let totalTransaction = 0;
        let totalDeposit = 0;
        let totalWithdraw = 0;
        let totalBalance = 0;

        models.User.sum('totalDeposit').then(result =>{
            totalDeposit = result;
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });

        models.User.sum('totalWithdraw').then(result =>{
            totalWithdraw = result;
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });

        models.User.sum('balance').then(result =>{
            totalBalance = result;
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });

        models.Transaction.findAll().then(result1 => {

            totalTransaction = result1.length;

            var arr = {
                status: 1, 
                "message": "success",
                "totalDeposit": totalDeposit,
                "totalWithdraw": totalWithdraw,
                "totalBalance": totalBalance,
                "totalTransaction": totalTransaction
            };

            res.status(200).json(arr);
        });
        
    }
}

//Login function
function login(req, res){
    const post = {
        email: req.body.email,
        password: req.body.password
    }

    const schema = {
        email: {type: "string", optional: false, empty: false},
        password: {type: "string", optional: false, empty: false}
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

    models.Admin.findOne({where:{email:req.body.email}}).then(result =>{
        if(result === null){
            res.status(200).json({
                status: 0,
                message: "Invalid Credentials"
            });
        }else{
            bycryptjs.compare(req.body.password, result.password, function(err, results){
                if(results){
                    let jwtSecretKey = process.env.JWT_SECRET_KEY;
                    let data = {
                        time: Date(),
                        email: result.email,
                        adminId: result.id
                    }
                    const token = jwt.sign(data, jwtSecretKey);
                    var arr = {
                        status: 1, 
                        "message": "login successfull",
                        "adminId": result.id,
                        "email": result.email,
                        "name": result.name,
                        "type": result.type,
                        "token": token
                    };

                    res.status(200).json(arr);
                }else{
                    res.status(200).json({
                        status: 0,
                        message: "Invalid Credentials"
                    });
                }
            });
        }
    }).catch(error => {
        res.status(200).json({
            status: 2,
            message: "Something went wrong"
        });
    });
}

function change_password(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            currentPassword: req.body.currentPassword,
            newPassword: req.body.newPassword
        }

        const schema = {
            currentPassword: {type: "string", optional: false},
            newPassword: {type: "string", optional: false}
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

        let login_data = helper.get_adminId_token(req);
        const adminId = login_data.adminId;

        models.Admin.findOne({where:{id:adminId}}).then(result =>{
            if(result === null){
                res.status(200).json({
                    status: 0,
                    message: "Invalid token"
                });
            }else{
                bycryptjs.compare(req.body.currentPassword, result.password, function(err, results){
                    if(results){
                        bycryptjs.genSalt(10, function(err, salt){
                            bycryptjs.hash(req.body.newPassword, salt, function(err, hash){
                                const dt = {
                                    password: hash
                                }
                            
                                models.Admin.update(dt, {where:{
                                    id:adminId
                                }}).then(result => {
                                    res.status(200).json({
                                        status: 1,
                                        message: "Password updated"
                                    });
                                }).catch(error => {
                                    res.status(200).json({
                                        status: 0,
                                        message: "Something went wrong!"
                                    });
                                });
                            });
                        });
                    }else{
                        res.status(200).json({
                            status: 0,
                            message: "Current password is incorrect"
                        });
                    }
                });
            }
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong"
            });
        });
    }
}

function update_pin(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            pin: req.body.pin
        }

        const schema = {
            pin: {type: "string", optional: false}
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

        let login_data = helper.get_adminId_token(req);
        const adminId = login_data.adminId;

        models.Admin.findOne({where:{id:adminId}}).then(result =>{
            if(result === null){
                res.status(200).json({
                    status: 0,
                    message: "Invalid token"
                });
            }else{
                const dt = {
                    adminPIN: post.pin
                }
            
                models.Admin.update(dt, {where:{
                    id:adminId
                }}).then(result => {
                    res.status(200).json({
                        status: 1,
                        message: "PIN updated"
                    });
                }).catch(error => {
                    res.status(200).json({
                        status: 0,
                        message: "Something went wrong!"
                    });
                });
            }
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong"
            });
        });
    }
}

function check_pin(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            pin1: req.body.pin1,
            pin2: req.body.pin2,
            pin3: req.body.pin3,
        }

        const schema = {
            pin1: {type: "string", optional: false},
            pin2: {type: "string", optional: false},
            pin3: {type: "string", optional: false},
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

        let login_data = helper.get_adminId_token(req);
        const adminId = login_data.adminId;

        let subadmins = [2, 3, 4];

        let pin1 = req.body.pin1;
        let pin2 = req.body.pin2;
        let pin3 = req.body.pin3;

        models.Admin.findAll({
            where:{
                id:subadmins
            }
        }).then(result =>{
            if(result === null){
                res.status(200).json({
                    status: 0,
                    message: "Invalid token"
                });
            }else{
                let flag = "yes";
                for (var i = 0; i < result.length; i++) {
                    if(i == 0)
                    {
                        if(result[i].adminPIN !== pin1)
                        {
                            flag = "no";
                        }
                    }
                    if(i == 1)
                    {
                        if(result[i].adminPIN !== pin2)
                        {
                            flag = "no";
                        }
                    }
                    if(i == 2)
                    {
                        if(result[i].adminPIN !== pin3)
                        {
                            flag = "no";
                        }
                    }
                }

                if(flag == "yes")
                {
                    res.status(200).json({
                        status: 1,
                        message: "correct"
                    });
                }
                else
                {
                    res.status(200).json({
                        status: 3,
                        message: "incorrect"
                    });
                }
            }
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong"
            });
        });
    }
}

function all_transactions(req, res){
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        models.Transaction.findAll().then(result => {
            res.status(200).json({
                status: 1,
                data: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });
    }
}

function all_users(req, res){
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        models.User.findAll({
            attributes: [
               'id', 'firstName', 'lastName', 'email', 'referenceId', 'totalDeposit', 'totalWithdraw', 'balance', 'referralCode', 'createdAt', 'updatedAt'
            ],
        }).then(result => {
            res.status(200).json({
                status: 1,
                data: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });
    }
}

function users_transactions(req, res){
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false}
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
        
        let userId = post.userId;

        models.Transaction.findAll({
            where: {
                userId: userId
            },
        }).then(result => {
            res.status(200).json({
                status: 1,
                data: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });
    }
}

function add_referral_code(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId,
            code: req.body.code,
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false},
            code: {type: "string", optional: false, empty: false},
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
        
        let userId = post.userId;
        let code = post.code;

        let update_data = {
            referralCode: code
        };

        models.User.update(update_data, {where:{
            id:userId
        }}).then(result => {
            res.status(200).json({
                status: 1,
                message: "Data updated",
                post: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong",
                error: error
            });
        });
    }
}

function user_details(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false}
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
        
        let userId = post.userId;

        models.User.findOne({
            where:{
                id:userId
            }
        }).then(result => {
            res.status(200).json({
                status: 1,
                message: "success",
                record: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong",
                error: error
            });
        });
    }
}

function contact_requests(req, res){
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        models.ContactRequest.findAll().then(result => {
            res.status(200).json({
                status: 1,
                data: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });
    }
}

function add_bank_account(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            bankName: req.body.bankName,
            bankAccountNumber: req.body.bankAccountNumber,
            bankAccountName: req.body.bankAccountName
        }

        const schema = {
            bankName: {type: "string", optional: false, empty: false},
            bankAccountNumber: {type: "string", optional: false, empty: false},
            bankAccountName: {type: "string", optional: false, empty: false}
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

        // let login_data = helper.get_adminId_token(req);
        // const adminId = login_data.adminId;

        models.BankAccount.create(post).then(result => {

            res.status(200).json({
                status: 1,
                message: "Data saved",
                post: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong",
                error: error
            });
        });
    }
}

function bank_accounts_list(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        models.BankAccount.findAll().then(result => {
            res.status(200).json({
                status: 1,
                data: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });
    }
}

function update_bank_account(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            id: req.body.id,
            bankName: req.body.bankName,
            bankAccountNumber: req.body.bankAccountNumber,
            bankAccountName: req.body.bankAccountName
        }

        const schema = {
            id: {type: "string", optional: false, empty: false},
            bankName: {type: "string", optional: false, empty: false},
            bankAccountNumber: {type: "string", optional: false, empty: false},
            bankAccountName: {type: "string", optional: false, empty: false}
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

        models.BankAccount.update(post, {where:{
            id:req.body.id
        }}).then(result => {
            res.status(200).json({
                status: 1,
                message: "Data updated",
                post: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong",
                error: error
            });
        });
    }
}

function delete_bank_account(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            id: req.body.id
        }

        const schema = {
            id: {type: "string", optional: false, empty: false}
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

        models.BankAccount.destroy({
            where:{id:req.body.id}
        }).then(result => {
            if(result === 1)
            {
                res.status(200).json({
                    status: 1,
                    message: "Data deleted",
                });
            }
            else
            {
                res.status(200).json({
                    status: 0,
                    message: "Not found",
                });
            }
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong",
                error: error
            });
        });
    }
}

function assign_bank_account(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId,
            bankAccountId: req.body.bankAccountId,
            fees: req.body.fees,
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false},
            bankAccountId: {type: "string", optional: false, empty: false},
            fees: {type: "string", optional: false, empty: false}
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

        models.UsersBank.findOne({
            where:{userId:req.body.userId, bankAccountId:req.body.bankAccountId}
        }).then(result =>{
            if(result === null){
                models.UsersBank.create(post).then(result => {

                    res.status(200).json({
                        status: 1,
                        message: "Data saved",
                        post: result
                    });
                }).catch(error => {
                    res.status(200).json({
                        status: 2,
                        message: "Something went wrong",
                        error: error
                    });
                });
            }
            else
            {
                res.status(200).json({
                    status: 3,
                    message: "Already added"
                });
            }
        })
    }
}

function users_bank_accounts(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false}
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

        let userId = post.userId;

        models.UsersBank.findAll().then(result => {
            res.status(200).json({
                status: 1,
                data: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });
    }
}

function remove_users_bank_account(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId,
            bankAccountId: req.body.bankAccountId
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false},
            bankAccountId: {type: "string", optional: false, empty: false}
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

        models.UsersBank.destroy({
            where:{userId:req.body.userId, bankAccountId:req.body.bankAccountId}
        }).then(result =>{
            if(result === 1)
            {
                res.status(200).json({
                    status: 1,
                    message: "Data removed",
                    post: result
                });
            }
            else
            {
                res.status(200).json({
                    status: 2,
                    message: "Something went wrong!"
                });
            }
        })
    }
}

function add_crypto_account(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        let imageUrl = '';
        if(req.hasOwnProperty('file'))
        {
            imageUrl = req.file.filename;
        }

        let network = "";
        if(!req.body.network)
        {
            //
        }
        else
            network = req.body.network;

        const post = {
            currency: req.body.currency,
            walletAddress: req.body.walletAddress,
            network: network,
            QRImage: imageUrl
        }

        const schema = {
            currency: {type: "string", optional: false, empty: false},
            walletAddress: {type: "string", optional: false, empty: false}
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

        models.CryptoAccount.create(post).then(result => {
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

function crypto_account_list(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        models.CryptoAccount.findAll().then(result => {
            res.status(200).json({
                status: 1,
                data: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });
    }
}

function delete_crypto_account(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            id: req.body.id
        }

        const schema = {
            id: {type: "string", optional: false, empty: false}
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

        models.CryptoAccount.findOne({where:{id:req.body.id}}).then(result =>{
            if(result === null){
                res.status(200).json({
                    status: 0,
                    message: "Not found"
                });
            }else{
                var img = result.QRImage;
                var path = './uploads/'+img;

                models.CryptoAccount.destroy({
                    where:{id:req.body.id}
                }).then(result =>{
                    if(result === 1)
                    {
                        if(img != '')
                        {
                            fs.unlink(path, (err) => {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }
                        
                        res.status(200).json({
                            status: 1,
                            message: "Data removed",
                            post: result
                        });
                    }
                    else
                    {
                        res.status(200).json({
                            status: 2,
                            message: "Something went wrong!"
                        });
                    }
                })
            }
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });

    }
}

function assign_crypto_account(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId,
            cryptoAccountId: req.body.cryptoAccountId,
            fees: req.body.fees,
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false},
            cryptoAccountId: {type: "string", optional: false, empty: false},
            fees: {type: "string", optional: false, empty: false}
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

        models.usersCryptoAccount.findOne({
            where:{userId:req.body.userId, cryptoAccountId:req.body.cryptoAccountId}
        }).then(result =>{
            if(result === null){
                models.usersCryptoAccount.create(post).then(result => {

                    res.status(200).json({
                        status: 1,
                        message: "Data saved",
                        post: result
                    });
                }).catch(error => {
                    res.status(200).json({
                        status: 2,
                        message: "Something went wrong",
                        error: error
                    });
                });
            }
            else
            {
                res.status(200).json({
                    status: 3,
                    message: "Already added"
                });
            }
        })
    }
}

function users_crypto_accounts(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false}
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

        let userId = post.userId;

        models.usersCryptoAccount.findAll().then(result => {
            res.status(200).json({
                status: 1,
                data: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });
    }
}

function remove_users_crypto_account(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId,
            cryptoAccountId: req.body.cryptoAccountId
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false},
            cryptoAccountId: {type: "string", optional: false, empty: false}
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

        models.usersCryptoAccount.destroy({
            where:{userId:req.body.userId, cryptoAccountId:req.body.cryptoAccountId}
        }).then(result =>{
            if(result === 1)
            {
                res.status(200).json({
                    status: 1,
                    message: "Data removed",
                    post: result
                });
            }
            else
            {
                res.status(200).json({
                    status: 2,
                    message: "Something went wrong!"
                });
            }
        })
    }
}

function payment_links(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        models.PaymentLink.findAll({
            attributes: [
               'id', ['id', 'linkId'], 'userId', 'paymentType', 'productName', 'productImage', 'price', 'currency', 'paymentCode', 'linkStatus', 'createdAt', 'updatedAt'
            ],
        }).then(result => {
            res.status(200).json({
                status: 1,
                data: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });
    }
}

function approve_payment_link(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            linkId: req.body.linkId
        }

        const schema = {
            linkId: {type: "string", optional: false, empty: false}
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

        models.PaymentLink.findOne({where:{id:req.body.linkId}}).then(result =>{
            if(result === null){
                res.status(200).json({
                    status: 0,
                    message: "Not found"
                });
            }else{

                let linkId = req.body.linkId;
                const data_update = {
                    linkStatus: 'approved'
                }   

                models.PaymentLink.update(data_update, {where:{
                    id:linkId
                }}).then(result => {
                    res.status(200).json({
                        status: 1,
                        message: "Link approved"
                    });
                }).catch(error => {
                    res.status(200).json({
                        status: 0,
                        message: "Something went wrong!"
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
}

function add_p2p_exchange(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            advertiser: req.body.advertiser,
            price: req.body.price,
            currencyFrom: req.body.currencyFrom,
            currencyTo: req.body.currencyTo,
            paymentMethod: req.body.paymentMethod,
        }

        const schema = {
            advertiser: {type: "string", optional: false, empty: false},
            price: {type: "string", optional: false, empty: false},
            currencyFrom: {type: "string", optional: false, empty: false},
            currencyTo: {type: "string", optional: false, empty: false},
            paymentMethod: {type: "string", optional: false, empty: false}
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

        models.P2PExchange.create(post).then(result => {
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

function p2p_exchange_list(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        models.P2PExchange.findAll().then(result => {
            res.status(200).json({
                status: 1,
                data: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });
    }
}

function delete_p2p_exchange(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            id: req.body.id
        }

        const schema = {
            id: {type: "string", optional: false, empty: false}
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

        models.P2PExchange.findOne({where:{id:req.body.id}}).then(result =>{
            if(result === null){
                res.status(200).json({
                    status: 0,
                    message: "Not found"
                });
            }else{
                models.P2PExchange.destroy({
                    where:{id:req.body.id}
                }).then(result =>{
                    if(result === 1)
                    {
                        res.status(200).json({
                            status: 1,
                            message: "Data removed",
                            post: result
                        });
                    }
                    else
                    {
                        res.status(200).json({
                            status: 2,
                            message: "Something went wrong!"
                        });
                    }
                })
            }
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });

    }
}

function assign_fees(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId,
            cryptoWithdrawFees: req.body.cryptoWithdrawFees,
            cryptoDepositFees: req.body.cryptoDepositFees,
            bankTransferWithdrawFees: req.body.bankTransferWithdrawFees,
            bankTransferDepositFees: req.body.bankTransferDepositFees,
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false},
            cryptoWithdrawFees: {type: "string", optional: false, empty: false},
            cryptoDepositFees: {type: "string", optional: false, empty: false},
            bankTransferWithdrawFees: {type: "string", optional: false, empty: false},
            bankTransferDepositFees: {type: "string", optional: false, empty: false}
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

        models.UsersFee.findOne({
            where:{userId:req.body.userId}
        }).then(result =>{
            if(result === null){
                models.UsersFee.create(post).then(result => {

                    res.status(200).json({
                        status: 1,
                        message: "Data saved",
                        post: result
                    });
                }).catch(error => {
                    res.status(200).json({
                        status: 2,
                        message: "Something went wrong",
                        error: error
                    });
                });
            }
            else
            {
                const data_update = {
                    cryptoWithdrawFees: req.body.cryptoWithdrawFees,
                    cryptoDepositFees: req.body.cryptoDepositFees,
                    bankTransferWithdrawFees: req.body.bankTransferWithdrawFees,
                    bankTransferDepositFees: req.body.bankTransferDepositFees,
                };

                models.UsersFee.update(data_update, {where:{
                    userId:req.body.userId
                }}).then(result => {
                    res.status(200).json({
                        status: 1,
                        message: "Data updated"
                    });
                }).catch(error => {
                    res.status(200).json({
                        status: 0,
                        message: "Something went wrong!"
                    });
                });
            }
        })
    }
}

function users_fees(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId,
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false},
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

        models.UsersFee.findOne({
            where:{userId:req.body.userId}
        }).then(result =>{
            res.status(200).json({
                status: 1,
                data: result
            });
        });
    }
}

function payment_link_transactions(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        models.PaymentLinkTransaction.findAll().then(result => {
            res.status(200).json({
                status: 1,
                data: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });
    }
}

function update_link_transaction_status(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            transactionId: req.body.transactionId
        }

        const schema = {
            transactionId: {type: "string", optional: false, empty: false}
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

        let transactionId = req.body.transactionId;

        models.PaymentLinkTransaction.findOne({where:{id:transactionId}}).then(result =>{
            if(result === null){
                res.status(200).json({
                    status: 0,
                    message: "Not found"
                });
            }else{
                let paymentId = result.paymentId;

                const update_post = {
                    accepted: "yes"
                };

                models.PaymentLinkTransaction.update(update_post, {where:{
                    id:req.body.transactionId
                }}).then(result => {

                    models.PaymentLink.findOne({
                        where:{
                            id:paymentId
                        }
                    }).then(result1 => { 

                        let userId = result1.userId;
                        let price = result1.price;

                        models.User.findOne({
                            where:{
                                id:userId
                            }
                        }).then(result2 => { 

                            let totalDeposit = result2.totalDeposit;
                            let balance = result2.balance;

                            totalDeposit = totalDeposit + price;
                            balance = balance + price;

                            let data1 = {
                                totalDeposit:totalDeposit,
                                balance:balance
                            }

                            models.User.update(data1, {where:{
                                id:userId
                            }}).then(result3 => {
                                res.status(200).json({
                                    status: 1,
                                    message: "Updated successfully",
                                    post: result,
                                });
                            }).catch(error => {
                                res.status(200).json({
                                    status: 2,
                                    message: "Something went wrong save",
                                    error: error
                                });
                            });
                            
                        }).catch(error => {
                            res.status(200).json({
                                status: 2,
                                message: "Something went wrong",
                                error: error
                            });
                        });
                    }).catch(error => {
                        res.status(200).json({
                            status: 2,
                            message: "Something went wrong",
                            error: error
                        });
                    });
                }).catch(error => {
                    res.status(200).json({
                        status: 2,
                        message: "Something went wrong",
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
}

function completed_transaction(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        models.PaymentLinkTransaction.findOne({
            where:{
                status:'completed',
                accepted: 'no'
            }
        }).then(result =>{
            if(result === null){
                res.status(200).json({
                    status: 1,
                    message: 'no',
                    // total: 0
                });
            }else{
                var n = result.length;
                res.status(200).json({
                    status: 1,
                    message: "yes",
                    // total: n,
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
}

function get_users_deposits(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false}
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
        
        let userId = post.userId;
        const all_deposits = [];
        const arr1 = [];

        models.PaymentLink.findAll({
            where:{
                userId:userId
            }
        }).then(result =>{
            if(result === null)
            {
                res.status(200).json({
                    status: 3,
                    message: "Result not found",
                });
            }
            else
            {
                for (var i = 0; i <= result.length -1; i++) {
                    let pId = result[i].id;
                    arr1.push(pId);
                }

                models.PaymentLinkTransaction.findAll({
                    where:{
                        paymentId:arr1, 
                        accepted: "yes"
                    }
                }).then(result1 =>{
                    if(result1 === null){
                        res.status(200).json({
                            status: 3,
                            message: "Result not found",
                        });
                    }else{
                        var all = [];
                        var trIds = [];
                        for (var j = 0; j < result1.length; j++)  {
                            all.push(result1[j].paymentId);
                            var a = result1[j].paymentId;
                            var b = result1[j].id;
                            var obj = {'paymentId': a, 'trnsId': b};
                            trIds.push(obj);
                        }
                        
                        models.PaymentLink.findAll({
                            where:{
                                id:all
                            }
                        }).then(result2 =>{
                            if(result2 === null)
                            {
                                res.status(200).json({
                                    status: 3,
                                    message: "Result not found",
                                });
                            }
                            else
                            {
                                /*let newArr = []; 
                                for (var k = 0; k < result2.length; k++) {
                                    // result2[k]
                                    
                                    let arr2 = {

                                    }
                                }*/
                                console.log(trIds);
                                res.status(200).json({
                                    status: 1,
                                    message: "success",
                                    data: result2
                                });
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
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });

        /* for (var i = 0; i <= result.length -1; i++) {
                let pId = result[i].id;
                const arr = result;
                models.PaymentLinkTransaction.findOne({
                    where:{
                        paymentId:pId, 
                        accepted: "yes"
                    }
                }).then(result1 =>{
                    if(result1 === null){
                        //
                    }else{
                        all_deposits.push(arr);
                        // console.log(all_deposits);
                    }
                }).catch(error => {
                    // res.status(200).json({
                    //     status: 2,
                    //     message: "Something went wrong!",
                    //     error: error
                    // });
                });

                console.log(all_deposits);
            }*/

            /*res.status(200).json({
                status: 1,
                message: "success",
                data: all_deposits
            });*/

        // console.log(all_deposits);
    }
}

function get_users_withdraws(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        const post = {
            userId: req.body.userId
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false}
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
        
        let userId = post.userId;

        models.WithdrawRequest.findAll({
            where:{
                userId:userId
            }
        }).then(result =>{
            // console.log(result);
            
            res.status(200).json({
                status: 1,
                message: "success",
                data: result
            });
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong!",
                error: error
            });
        });
    }
}

module.exports = {
    index:index,
    login: login,
    change_password: change_password,
    update_pin:update_pin,
    check_pin:check_pin,
    all_transactions:all_transactions,
    all_users:all_users,
    users_transactions:users_transactions,
    add_referral_code:add_referral_code,
    user_details:user_details,
    contact_requests:contact_requests,
    add_bank_account:add_bank_account,
    bank_accounts_list:bank_accounts_list,
    update_bank_account:update_bank_account,
    delete_bank_account:delete_bank_account,
    assign_bank_account:assign_bank_account,
    users_bank_accounts:users_bank_accounts,
    remove_users_bank_account:remove_users_bank_account,
    add_crypto_account:add_crypto_account,
    uploadImg:uploadImg,
    crypto_account_list:crypto_account_list,
    delete_crypto_account:delete_crypto_account,
    payment_links:payment_links,
    approve_payment_link:approve_payment_link,
    assign_crypto_account:assign_crypto_account,
    users_crypto_accounts:users_crypto_accounts,
    remove_users_crypto_account:remove_users_crypto_account,
    add_p2p_exchange:add_p2p_exchange,
    p2p_exchange_list:p2p_exchange_list,
    delete_p2p_exchange:delete_p2p_exchange,
    assign_fees:assign_fees,
    users_fees:users_fees,
    payment_link_transactions:payment_link_transactions,
    update_link_transaction_status:update_link_transaction_status,
    completed_transaction:completed_transaction,
    get_users_deposits:get_users_deposits,
    get_users_withdraws:get_users_withdraws
};
