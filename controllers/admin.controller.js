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
               'id', 'firstName', 'lastName', 'email', 'referenceId', 'totalDeposit', 'totalWithdraw', 'balance', 'createdAt', 'updatedAt'
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
            bankAccountId: req.body.bankAccountId
        }

        const schema = {
            userId: {type: "string", optional: false, empty: false},
            bankAccountId: {type: "string", optional: false, empty: false},
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
                models.CryptoAccount.destroy({
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

module.exports = {
    index:index,
    login: login,
    change_password: change_password,
    all_transactions:all_transactions,
    all_users:all_users,
    users_transactions:users_transactions,
    contact_requests:contact_requests,
    add_bank_account:add_bank_account,
    bank_accounts_list:bank_accounts_list,
    assign_bank_account:assign_bank_account,
    users_bank_accounts:users_bank_accounts,
    remove_users_bank_account:remove_users_bank_account,
    add_crypto_account:add_crypto_account,
    uploadImg:uploadImg,
    crypto_account_list:crypto_account_list,
    delete_crypto_account:delete_crypto_account,
    payment_links:payment_links,
    approve_payment_link:approve_payment_link
};
