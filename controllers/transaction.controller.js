const Validator = require('fastest-validator');
const models = require('../models');
const jwt = require('jsonwebtoken'); 
const helper = require('../helper');


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

function send(req, res) {
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
        
        const post = {
            amount: req.body.amount,
            address: req.body.address,
            network: req.body.network
        }

        const schema = {
            amount: {type: "string", optional: false, empty: false, numeric: true },
            address: {type: "string", optional: false, empty: false},
            network: {type: "string", optional: false, empty: false},
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

        post.userId = userId;
        models.Transaction.create(post).then(result => {

            res.status(200).json({
                status: 1,
                message: "Transaction saved",
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

module.exports = {
    index:index,
    send:send
};