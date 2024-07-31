const models = require("../models");
const bycryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
const helper = require('../helper');
const Validator = require('fastest-validator');
require('dotenv').config();

//Signup function
function index(req, res){
    const post = {
        email: req.body.email,
        password: req.body.password,
        referenceId: req.body.referenceId
    }

    const schema = {
        email: {type: "string", optional: false, empty: false},
        password: {type: "string", optional: false, empty: false},
        referenceId: {type: "string", optional: false, empty: false},
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
    
    models.User.findOne({where:{email:req.body.email}}).then(result =>{
        if(result === null){
            bycryptjs.genSalt(10, function(err, salt){
                bycryptjs.hash(req.body.password, salt, function(err, hash){
                    
                    post.password = hash;
                    post.loginCode = generateCode();
                    post.loggedIn = "no";
                
                    models.User.create(post).then(result => {
                        
                        let jwtSecretKey = process.env.JWT_SECRET_KEY;
                        let data = {
                            time: Date(),
                            email: post.email,
                            userId: post.id
                        }
                        const token = jwt.sign(data, jwtSecretKey);
                        res.status(200).json({
                            status: 1,
                            message: "Registered successfully",
                            post: result,
                            token: token
                        });
                    }).catch(error => {
                        res.status(200).json({
                            status: 2,
                            message: "Something went wrong"
                        });
                    });
                });
            });
            
        }else{
            res.status(200).json({
                status: 0,
                message: "Email already exists"
            });
        }
    }).catch(error => {
        res.status(200).json({
            status: 2,
            message: "Something went really wrong"
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
    index: index,
}
