const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: { unique: true, dropDups: true } },
    name: { type: String, required: true },
    email: { type: String, required: true, index: { unique: true, dropDups: true } },
    contact: { type: String, required: true },
    course: { type: String, required: true }
});

module.exports = mongoose.model('Student', studentSchema);
