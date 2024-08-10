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
        
        models.User.findOne({where:{id:userId}}).then(result =>{
            console.log(result);
            let totalTransaction = 0;
            models.Transaction.findAll({
                where: {
                    userId: userId
                },
            }).then(result1 => {

                totalTransaction = result1.length;

                var arr = {
                    status: 1, 
                    "message": "success",
                    "userId": result.id,
                    "firstName": result.firstName,
                    "lastName": result.lastName,
                    "email": result.email,
                    "totalDeposit": result.totalDeposit,
                    "totalWithdraw": result.totalWithdraw,
                    "balance": result.balance,
                    "totalTransaction": totalTransaction
                };

                res.status(200).json(arr);
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
        }

        const schema = {
            paymentType: {type: "string", optional: false, empty: false},
            productName: {type: "string", optional: false, empty: false},
            // productImage: {type: "string", optional: false, empty: false},
            price: {type: "string", optional: false, empty: false},
            currency: {type: "string", optional: false, empty: false}
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

module.exports = {
    index:index,
    add_payment_link:add_payment_link,
    uploadImg:uploadImg
};
