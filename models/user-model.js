const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    username: {type: String, unique: true, required: true},
    firstName: {type: String},
    lastName: {type: String},
    avatar: {type: String},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String}
});

module.exports = model("User", UserSchema);
