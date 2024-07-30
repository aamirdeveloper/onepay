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

            res.status(200).json({
                status: 1,
                data: result,
                totalBets: totalBets
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