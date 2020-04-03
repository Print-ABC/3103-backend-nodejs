const mongoose = require('mongoose');

const friendSchema = mongoose.Schema({
    requester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requester: {type: String, required: true},
    requester_username: {type: String, required: true},
    recipient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipient: {type: String, required: true},
    recipient_username: {type: String, required: true}
})
module.exports = mongoose.model('Friend', friendSchema)
