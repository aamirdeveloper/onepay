const models = require("../models");
const bycryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
const helper = require('../helper');
const Validator = require('fastest-validator');
require('dotenv').config();

//Login function
function login(req, res){
    models.User.findOne({where:{email:req.body.email}}).then(result =>{
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
                        userId: result.id
                    }
                    const token = jwt.sign(data, jwtSecretKey);

                    var loginCode = generateCode();
                    var userId = result.id;
                    var user_data = result;

                    const user = {
                        loginCode: loginCode,
                        loggedIn: "yes"
                    }

                    models.User.update(user, {where:{
                        id:userId
                    }}).then(result => {
                        
                        var arr = {
                            status: 1, 
                            "message": "login successfull",
                            "userId": user_data.id,
                            "email": user_data.email,
                            "referenceId": user_data.referenceId,
                            "loginCode": loginCode,
                            "token": token
                        };

                        res.status(200).json(arr);

                    }).catch(error => {
                        res.status(200).json({
                            status: 0,
                            message: "Something went wrong!"
                        });
                    });

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
            message: "Something really went wrong"
        });
    });
}

function check_login_status(req, res) {

    const post = {
        loginCode: req.body.loginCode
    }

    const schema = {
        loginCode: {type: "string", optional: false, empty: false}
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

    models.User.findOne({where:{loginCode:req.body.loginCode}}).then(result =>{
        if(result === null){
            res.status(200).json({
                status: 0,
                message: "Invalid Code"
            });
        }else{
            if(result.loggedIn == "yes")
            {
                let jwtSecretKey = process.env.JWT_SECRET_KEY;
                let data = {
                    time: Date(),
                    email: result.email,
                    userId: result.id
                }
                const token = jwt.sign(data, jwtSecretKey);

                var loginCode = generateCode();
                var userId = result.id;
                var user_data = result;

                const user = {
                    loginCode: loginCode
                }

                models.User.update(user, {where:{
                    id:userId
                }}).then(result => {
                    
                    var arr = {
                        status: 1, 
                        "message": "login successfull",
                        "userId": user_data.id,
                        "email": user_data.email,
                        "referenceId": user_data.referenceId,
                        // "loginCode": loginCode,
                        "token": token
                    };

                    res.status(200).json(arr);

                }).catch(error => {
                    res.status(200).json({
                        status: 0,
                        message: "Something went wrong!"
                    });
                });
            }
            else
            {
                res.status(200).json({
                    status: 3,
                    message: "User is not logged in"
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

function get_login_status(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        let login_data = helper.get_userId_token(req);
        const userId = login_data.userId;

        models.User.findOne({where:{id:userId}}).then(result =>{
            if(result === null){
                res.status(200).json({
                    status: 0,
                    message: "Invalid token"
                });
            }else{
                var arr = {
                    status: 1, 
                    "message": "success",
                    "loggedIn": result.loggedIn
                };

                res.status(200).json(arr);
            }
        }).catch(error => {
            res.status(200).json({
                status: 2,
                message: "Something went wrong"
            });
        });
    }
}

function logout(req, res) {
    let resp = helper.check_token(req);
    if(resp !== "Successfully Verified")
    {
        console.error(`Token error`, resp);
        res.json(resp);
    }
    else
    {
        let login_data = helper.get_userId_token(req);
        const userId = login_data.userId;

        models.User.findOne({where:{id:userId}}).then(result =>{
            if(result === null){
                res.status(200).json({
                    status: 0,
                    message: "Invalid token"
                });
            }else{
                const user = {
                    loggedIn: "no"
                }

                models.User.update(user, {where:{
                    id:userId
                }}).then(result => {
                    
                    var arr = {
                        status: 1, 
                        "message": "logout successfull"
                    };

                    res.status(200).json(arr);

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

        let login_data = helper.get_userId_token(req);
        const userId = login_data.userId;

        models.User.findOne({where:{id:userId}}).then(result =>{
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
                                const user = {
                                    password: hash
                                }
                            
                                models.User.update(user, {where:{
                                    id:userId
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

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
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
    login: login,
    check_login_status: check_login_status,
    get_login_status: get_login_status,
    logout: logout,
    change_password: change_password
}
