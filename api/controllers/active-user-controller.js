const mongoose = require('mongoose');

const ActiveUser = require('../models/ActiveUser');

exports.active_users_logout = (req,res, next) => {
    const id = req.params.uid;
    ActiveUser.findOneAndRemove({uid: id})
    .exec()
    .then(result => {
        res.status(200).json({});
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({});
    });
}
