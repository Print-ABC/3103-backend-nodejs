const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const ActiveUser = require('../models/ActiveUser');

module.exports = (req, res, next) => {
    try {
        const token = escape(req.headers.authorization);
        if (req.body.friendsOp){
            // Verify JWT
            jwt.verify(token, config.secret);
            next();
        } else {
            var uid;
            if (req.body.uid){
                uid = req.body.uid;
            } else {
                uid = req.params.uid;
            }
            
            // Verify JWT
            jwt.verify(token, config.secret);
            // Check if uid and token matches entry in ActiveUser table
            ActiveUser.find({
                $and: [{uid: escape(uid)}, {token: token}]
            })
            .exec()
            .then(user=>{
                if (user === undefined || user.length == 0){
                    throw new Error("no matching active users");
                } else {
                    next();
                }
            })
            .catch (err=>{
                return res.status(403).json({
                    message: 'Auth Failed',
                    success: false
                });
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(403).json({
            message: 'Auth Failed',
            success: false
        });
    }
};