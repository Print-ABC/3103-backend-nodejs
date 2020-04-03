const mongoose = require('mongoose');

const User = require('../models/User');
const Friend = require('../models/Friend');
const config = require('../../config/config');

//GET: Retrieve requests with the given requester uid
exports.friend_get_requests_requester = (req, res, next) => {
  Friend.find( {'requester_id': req.params.uid}, function (err, docs){
    if(err) {
      console.log(err);
      res.status(500).json( {error: err} );
    }
    res.status(200).json(docs);
  });
}

//GET: Retrieve requests with the given recipient uid
exports.friend_get_requests_recipient = (req, res, next) => {
  Friend.find( {'recipient_id': req.params.uid}, function (err, docs){
    if(err) {
      console.log(err);
      res.status(500).json( {error: err} );
    }
    res.status(200).json(docs);
  });
}

//POST: Make a new friend request
exports.friend_post_request = (req, res, next) => {
  const request = new Friend({
      _id: new mongoose.Types.ObjectId(),
      requester_id: req.body.requester_id,
      requester: req.body.requester,
	  requester_username: req.body.requester_username,
      recipient_id: req.body.recipient_id,
      recipient: req.body.recipient,
	  recipient_username: req.body.recipient_username
    }
  );
  request.save()
        .then(result => {
          console.log(result);
          res.status(201).json({
            message: 'Friend request created successfully',
            success: true});
        })
        .catch(err => {
          console.log(err);
          res.status(201).json({
            error: err,
            message: "Failed to create friend request",
            success: false
          });
        });
}

//UPDATE: Add uid to list of friends of an existing user
exports.update_friendlist_add = (req, res, next) => {
  User.update(
    { "_id": req.body.requester_id },
    { $push: {"friendship": req.body.recipient_id} },
    function (err, docs) {
      if(err) {
        console.log(err);
        res.status(500).json( {error: err} );
      }
      res.status(200).json({
        message: 'Update: New friend added to friendlist'
      });
    }
  );
}

//UPDATE: Remove a uid from list of friends of an existing user
exports.update_friendlist_remove = (req, res, next) => {
  User.updateOne(
    { "_id": req.body.requester_id },
    { $pull: {"friendship": req.body.recipient_id} },
    function (err, docs) {
      if(err) {
        console.log(err);
        res.status(500).json( { error: err, success: false } );
      }
      res.status(200).json({});
      console.log(docs);
    }
  );
}

//DELETE: Delete an existing friend request
exports.friend_delete_request = (req, res, next) => {
    Friend.findByIdAndRemove({ _id: req.params.id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Friend request deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}
