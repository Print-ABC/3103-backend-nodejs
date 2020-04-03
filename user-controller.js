const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const nodemailer = require('nodemailer');
const rand = require('secure-random-string');

const User = require('../models/User');
const Organization = require('../models/Organization');
const ActiveUser = require('../models/ActiveUser');
const Student = require('../models/Student');
const config = require('../../config/config');
const utils = require('../../common/Utils');

exports.users_get_cards_info = (req, res) => {
    if (req.body.cards) {
        //Loop through each card that a user owns
        console.log(req.body.cards);
        const p1 = Organization.find({ _id: { $in: req.body.cards } }).select("name organization jobTitle contact email ").exec();
        const p2 = Student.find({ _id: { $in: req.body.cards } }).select("name course email contact").exec();
        Promise.all([p1, p2])
            .then(result => {
                console.log(result);
                return res.status(200).json({
                    orgCards: result[0],
                    stuCards: result[1]
                })
            }
            )
            .catch(err => {
                console.log(err);
                return res.status(400).json({});
            })
    } else {
        return res.status(400).json({});
    }
}

function checkOrgCard(cardId) {
    const promise = Organization.findById(cardId).exec();
    return promise;
}

function checkStudentCard(cardId) {
    const promise = Student.findById(cardId).exec();
    return promise;
}

exports.users_get_all = (req, res, next) => {
    User.find()
        .select('_id name username email contact role password friendship cards')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                users: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        username: doc.username,
                        email: doc.email,
                        contact: doc.contact,
                        role: doc.role,
                        password: doc.password,
                        friendship: doc.friendship,
                        cards: doc.cards,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:+' + config.port + '/users/' + doc._id
                        }
                    };
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({
                error: err
            });
        });
}

exports.users_get_username = (req, res, next) => {
    User.findOne({
        username: new RegExp('^' + req.params.username + '$', "i"),
        role: { $eq: 0 }
    })
        .select('_id name username role')
        .exec()
        .then(doc => {
            if (!doc) {
                res.status(404).json(doc);
            }
            res.status(200).json(doc);
        })
        .catch(err => {
            res.status(500).json(err);
        });
}

exports.users_get_name = (req, res, next) => {
    User.findById(req.params.uid)
        .select('_id name')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                // Success response
                res.status(200).json({
                    _id: doc._id,
                    username: doc.name,
                    success: true
                });
            } else {
                // ID does not exist
                res.status(200).json({ success: false });
            }
        }).catch(err => {
            console.log(err);
            // Failure response
            res.status(200).json({ success: false });
        });
}

exports.users_register_user = (req, res, next) => {
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        contact: req.body.contact,
        role: req.body.role,
        password: req.body.password,
        friendship: req.body.friendship,
        cards: req.body.cards
    });
    user.save()
        .then(result => {
            console.log(result);
            // Success response
            return res.status(201).json({});
        })
        .catch(err => {
            console.log(err);
            if (err.errmsg.includes("duplicate")) {
                return res.status(409).json({});
            } else {
                return res.status(400).json({});
            }

        });
}

const tokenArr = new Array();
const userArr = new Array();

exports.users_login = (req, res, next) => {
    // check if username exist in User collection
    tokenArr.pop();
    userArr.pop();
    // const twoFA = rand({ alphanumeric: true, length: 10 });
    const twoFA = "FFFF87283F";
    tokenArr.push(twoFA);
    userArr.push(req.body.username);
    User.find({ username: req.body.username })
        .exec()
        .then(user => {
            // If username not found
            if (user.length < 1) {
                return res.status(401).json({});
            }
            // Compare input password with stored password
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                // password does not match
                if (err) {
                    console.log(err);
                    return res.status(201).json({
                        message: 'Login failed',
                        success: false
                    });
                } else {
                    const transporter = nodemailer.createTransport({
                        secure: false, // use SSL
                        port: 25, // port for secure SMTP
                        service: 'gmail',
                        auth: {
                            user: 'ncshare.inc@gmail.com',
                            pass: 'Tsd677%fffffffff'
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });
                    console.log('Generated 2FA:', twoFA);
                    const mailOptions = {
                        from: 'admin@mydomain.com',
                        to: user[0].email,
                        subject: '2FA OTP Verificator (Do Not Reply)',
                        text: 'Your OTP verificator is: ' + twoFA
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            //console.log(error);
                            return res.status(404).json({});
                        } else {
                            console.log('Email sent: ' + info.response);
                            return res.status(200).json({
                                message: 'Verificator Sent!',
                                success: true
                            });
                        }
                    });
                }
            });
            return res.status(200).json({});
        })
        .catch(err => {
            // console.log(err);
            return res.status(401).json({});
        });
}

exports.users_2fa = (req, res, next) => {
    console.log('in array', tokenArr[0]);
    console.log('in array', userArr[0]);
    const userInputToken = req.params.fatoken;
    User.find({ username: userArr[0] })
        .exec()
        .then(user => {
            // If username not found
            if (user.length < 1) {
                console.log("wrong one");
                return res.status(401);
            }
            console.log(userInputToken);
            console.log(tokenArr[0]);
            if (userInputToken == tokenArr[0]) {
                tokenArr.pop();
                userArr.pop();
                // Get card ID of user if available, returns "none" if card not created
                const cardId = getCardIdByUid(user[0].role, user[0]._id, function (cardId) {
                    var token = jwt.sign({
                        cardId: cardId,
                        name: user[0].name,
                        username: user[0].username,
                        friendship: user[0].friendship,
                        cards: user[0].cards,
                        _id: user[0]._id,
                        role: user[0].role
                    }, config.secret, {
                            // jwt token expires in 20 minutes
                            expiresIn: config["session-duration"]
                        });

                    const fakeToken = utils.manipulateToken(token);
                    const parts = fakeToken.split('.');
                    headerLength = parts[0].length;
                    payLoadLength = parts[1].length;
                    signatureLength = parts[2].length;
                    // Check if user has logged in before
                    ActiveUser.findOne({ uid: user[0]._id })
                        .select('uid token createdAt')
                        .exec()
                        .then(active => {
                            // Has logged in before
                            if (active) {
                                // Check if token has expired
                                const diff = Math.abs(new Date() - active.createdAt);
                                // Token has expired
                                if (diff >= config["session-duration"]) {
                                    const query = { uid: active.uid };
                                    // Update current active user field with new token and time
                                    ActiveUser.update(query, {
                                        token: token,
                                        createdAt: new Date()
                                    }).exec()
                                        .then()
                                        .catch(err => {
                                            console.log(err);
                                        })
                                } else {
                                    // return current token if token has not expired
                                    // token = active.token;
                                    console.log("correct one");
                                    return res.status(401).json({
                                        message: "Session still active please try again later"
                                    })
                                }
                            } else {
                                // Add user into ActiveUser collection after first time log in
                                const activeUser = new ActiveUser({
                                    uid: user[0]._id,
                                    token: token
                                });
                                activeUser.save()
                                    .then()
                                    .catch(err => {
                                        //console.log(err);
                                    });
                            }
                            res.status(200).json({
                                welcome: utils.generateFakeToken(headerLength, payLoadLength, signatureLength),
                                to: utils.generateFakeToken(headerLength, payLoadLength, signatureLength),
                                team: fakeToken,
                                thirtyone: utils.generateFakeToken(headerLength, payLoadLength, signatureLength)
                            });
                        })
                        .catch(err => {
                            console.log(err);
                        })

                })
            }
            else {
                console.log("wrong one 1");
                return res.status(401).json({});
            }
        })
        .catch(err => {
            console.log(err);
            console.log("wrong one 2");
            return res.status(401).json({});
        });
}

exports.users_get_one = (req, res, next) => {
    const id = req.params.uid;
    User.findById(id)
        .select('_id name username email contact role password friendship cards')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                // Success response
                res.status(200).json({ doc });
            } else {
                // ID does not exist
                res.status(404).json({ message: 'No valid entry found for provided ID' });
            }
        }).catch(err => {
            console.log(err);
            // Failure response
            res.status(500).json({ error: err });
        });
}

exports.users_delete_one = (req, res, next) => {
    const id = req.params.uid;
    User.deleteOne({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.users_update_one = (req, res, next) => {
    const id = req.params.uid;
    const updateOps = {};
    for (const ops of req.body) {
        // Obtain an object of the update operations we want to perform
        updateOps[ops.propName] = ops.value;
    }
    User.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User updated',
                request: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

// Retrieve cardId of a user
function getCardIdByUid(role, uid, callback) {
    // If organization
    if (role == 1) {
        Organization.findOne({ uid: uid })
            .select('_id')
            .exec()
            .then(result => {
                if (result) {
                    callback(result._id);
                } else {
                    return callback("none");
                }
            })
            .catch(err => {
                return callback("none");
            })
    } else {
        Student.findOne({ uid: uid })
            .select('_id')
            .exec()
            .then(result => {
                if (result) {
                    callback(result._id);
                } else {
                    return callback("none");
                }
            })
            .catch(err => {
                return callback("none");
            })
    }
}

exports.users_find_cards = (req, res, next) => {
    const id = req.params.uid;
    const cardToCheck = req.params.cardtocheck;
    console.log(id);
    User.findById(id)
        .select('cards')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                // Success response
                //  res.status(200).json({ doc });
                console.log(doc.cards);
                if (doc.cards.indexOf(cardToCheck) > -1) {
                    //Card already exist in collection, end.
                    console.log("EXIST!");
                    res.status(406).json({});
                } else {
                    //Card does not exist, proceed to add into database
                    console.log("NOT EXIST!");
                    User.updateOne(
                        { "_id": id },
                        { $push: { "cards": cardToCheck } },
                        function (err, docs) {
                            if (err) {
                                console.log(err);
                                res.status(500).json({ error: err, success: false });
                            }
                            res.status(200).json({ });
                        }
                    );
                }
            } else {
                // ID does not exist
                res.status(404).json({ message: 'No valid entry found for provided ID' });
            }
        }).catch(err => {
            console.log(err);
            // Failure response
            res.status(500).json({ error: err });
        });

}

/**
     * {JSDoc}
     *
     * The splice() method changes the content of a string by removing a range of
     * characters and/or adding new characters.
     *
     * @this {String}
     * @param {number} start Index at which to start changing the string.
     * @param {number} delCount An integer indicating the number of old chars to remove.
     * @param {string} newSubStr The String that is spliced in.
     * @return {string} A new string with the spliced substring.
     */
String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
}
