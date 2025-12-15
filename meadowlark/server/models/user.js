
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    authId: String,
    name: String,
    email: String,
    role: String,
    created: Date,
})
