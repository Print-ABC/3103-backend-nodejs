const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String, 
        required: true,
        minlength: 1,
        maxlength: 30,
        match: /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
    },
    username: {
        type: String, 
        required: true, 
        index: {unique: true, dropDups: true},
        minlength: 8,
        maxlength: 25,
        match: /^[a-zA-Z0-9._-]{8,25}$/
    },
    email: {
        type: String, 
        required: true, 
        index: {unique: true, dropDups: true},
        minlength: 1,
        maxlength: 40,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    contact: {
        type: String, 
        required: true,
        minlength: 8,
        maxlength: 8,
        match: /(6|8|9)[0-9]{7}/
    },
    role: {
        type: Number, 
        required: true,
        min: 0,
        max: 1
    },
    password: {
        type: String, 
        required: true,
        minlength: 16,
        maxlength: 35,
        match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{16,35})/
    },
    friendship: {type: [String], required: true, default: []},
    cards: {type: [String], required: true, default: []}
});

// Create encrypted password
userSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});
module.exports = mongoose.model('User', userSchema);
