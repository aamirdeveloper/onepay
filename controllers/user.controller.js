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

module.exports = {
    index:index
};
