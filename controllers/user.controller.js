const Validator = require('fastest-validator');
const models = require('../models');
const jwt = require('jsonwebtoken'); 
const helper = require('../helper');
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
        let user = helper.get_userId_token(req);
        let userId = user.userId;

        let bankDepositFess = 0;
        let totalTransaction = 0;
        let user_data = [];

        models.User.findOne({where:{id:userId}}).then(result =>{
            user_data = result;
            
            models.Transaction.findAll({
                where: {
                    userId: userId
                },
            }).then(result1 => {
                totalTransaction = result1.length;

                models.UsersBank.findOne({
                    where: {
                        userId:userId
                    },
                    order: [
                        ['id', 'DESC']
                    ]
                }).then(result1 => {
                    bankDepositFess = result1.fees;

                    models.usersCryptoAccount.findOne({
                        where: {
                            userId:userId
                        },
                        order: [
                            ['id', 'DESC']
                        ]
                    }).then(result2 => {
                        let cryptoDepositFess = result2.fees;

                        var arr = {
                            status: 1, 
                            "message": "success",
                            "userId": user_data.id,
                            "firstName": user_data.firstName,
                            "lastName": user_data.lastName,
                            "email": user_data.email,
                            "totalDeposit": user_data.totalDeposit,
                            "totalWithdraw": user_data.totalWithdraw,
                            "balance": user_data.balance,
                            "referralCode": user_data.referralCode,
                            "totalTransaction": totalTransaction,
                            "bankDepositFess": bankDepositFess,
                            "cryptoDepositFess": cryptoDepositFess
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

function add_payment_link(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        let user = helper.get_userId_token(req);
        let userId = user.userId;

        let imageUrl = '';
        if(req.hasOwnProperty('file'))
        {
            imageUrl = req.file.filename;
        }
        const post = {
            paymentType: req.body.paymentType,
            productName: req.body.productName,
            productImage: imageUrl,
            price: req.body.price,
            currency: req.body.currency,
            // fees: req.body.fees,
        }

        const schema = {
            paymentType: {type: "string", optional: false, empty: false},
            productName: {type: "string", optional: false, empty: false},
            // productImage: {type: "string", optional: false, empty: false},
            price: {type: "string", optional: false, empty: false},
            currency: {type: "string", optional: false, empty: false},
            // fees: {type: "string", optional: false, empty: false}
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

        let paymentCode = generateCode(10);
        post.userId = userId;
        post.paymentCode = paymentCode;
        post.linkStatus = 'pending';
        
        models.PaymentLink.create(post).then(result => {
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

function generateCode(length) {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

function all_payment_links(req, res) {
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
               'id', 'userId', 'paymentType', 'productName', 'productImage', 'price', 'currency', 'paymentCode', 'linkStatus'
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

function delete_payment_link(req, res) {
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

        models.PaymentLink.findOne({where:{id:req.body.id}}).then(result =>{
            if(result === null){
                res.status(200).json({
                    status: 0,
                    message: "Not found"
                });
            }else{
                var img = result.productImage;
                var path = './uploads/'+img;

                models.PaymentLink.destroy({
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

function add_widget(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        let user = helper.get_userId_token(req);
        let userId = user.userId;

        const post1 = {
            websiteDomain: req.body.websiteDomain,
            paymentTypes: req.body.paymentTypes
        }

        const schema = {
            websiteDomain: {type: "string", optional: false, empty: false},
            paymentTypes: {type: "array", optional: false, empty: false}
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

        let types = post1.paymentTypes; 
        let paymentTypes = types.toString();

        let taxId = "";
        if(!req.body.taxId)
        {
            //
        }
        else
            taxId = req.body.taxId;

        let widgetCode = generateCode(10);
        let post = {
            userId:userId,
            websiteDomain: req.body.websiteDomain,
            taxId: taxId,
            paymentTypes: paymentTypes,
            widgetCode: widgetCode
        }
        
        models.Widget.create(post).then(result => {
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

function transaction_deposits(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        let user = helper.get_userId_token(req);
        let userId = user.userId;

        models.PaymentLink.findAll({
            where: {
                userId:userId
            }
        }).then(result => {
            /*res.status(200).json({
                status: 1,
                data: result
            });*/
            if(result === null)
            {
                res.status(200).json({
                    status: 3,
                    message: "No result"
                });
            }
            else
            {
                let all = [];
                for (var i = 0; i < result.length; i++) {
                    let id = result[i].id;
                    all.push(id);
                }
                console.log(all);

                models.PaymentLinkTransaction.findAll({
                    where: {
                        paymentId: all,
                        accepted: "yes"
                    }
                }).then(result1 => {
                    res.status(200).json({
                        status: 1,
                        message: "success",
                        data: result1
                    });
                }).catch(error => {
                    res.status(200).json({
                        status: 2,
                        message: "Something went wrong save",
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

function save_comment(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        let user = helper.get_userId_token(req);
        let userId = user.userId;

        const post1 = {
            id: req.body.id,
            comment: req.body.comment
        }

        const schema = {
            id: {type: "string", optional: false, empty: false},
            comment: {type: "string", optional: false}
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

        let post = {
            comments: req.body.comment
        }
        let id = req.body.id;
        
        models.PaymentLinkTransaction.update(post, {where:{
            id:id
        }}).then(result => {
            res.status(200).json({
                status: 1,
                message: "added",
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

module.exports = {
    index:index,
    add_payment_link:add_payment_link,
    uploadImg:uploadImg,
    all_payment_links:all_payment_links,
    delete_payment_link:delete_payment_link,
    add_widget:add_widget,
    transaction_deposits:transaction_deposits,
    save_comment:save_comment
};