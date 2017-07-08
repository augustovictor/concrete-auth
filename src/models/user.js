const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const _         = require('lodash');
const validator = require('validator');
const Guid      = require('guid');

const UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: Guid.raw()
    },
    name: {
        type    : String,
        required: true
    },
    email: {
        type     : String,
        required : true,
        unique   : true,
        trim     : true,
        minlength: 5,
        validate : {
            validator: (value) => validator.isEmail(value),
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type     : String,
        required : true,
        minlength: 5
    },
    tokens: [{
        access: {
            type    : String,
            required: true
        },
        token: {
            type    : String,
            required: true
        }
    }],
    phones: [{
        number: {
            type: String,
        },
        code: {
            type: Number,
        }
    }],
    last_login: {
        type   : Number,
        default: new Date().getTime()
    },
    created_at: {
        type: Number,
        default: new Date().getTime()
    },
    updated_at: {
        type   : Number,
        default: null
    }
}, {
    _id: false
});

UserSchema.pre('save', function(next) {
    const user = this;
    const now = new Date().getTime();
    
    user.updated_at = now;

    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

UserSchema.pre('update', function(next) {
    const user = this;
    this.updated_at = new Date.getTime();
    next();
});

UserSchema.statics.findByToken = function(token) {
    const User = this;
    let decodedIdAndToken;

    try {
        decodedIdAndToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch(e) {
        return Promise.reject(e);
    }

    return User.findOne({
        _id            : decodedIdAndToken._id,
        'tokens.token' : token,
        'tokens.access': 'auth'
    });
};

UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    return _.pick(userObject, ['_id', 'created_at', 'updated_at', 'last_login', 'tokens']);
};

UserSchema.methods.generateAuthToken = function() {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({ _id: user._id, access }, process.env.JWT_SECRET).toString();
    
    user.tokens = [];
    user.last_login = new Date().getTime();
    user.tokens.push({access, token});
    return user.save().then(() => token);
};

UserSchema.statics.findByCredentials = function(email, password) {
    const User = this;
    
    return User.findOne({ email }).then(user => {
        return new Promise((resolve, reject) => {
            if(!user) { 
                return reject({ status: 404, message: 'Invalid credentials'});
            }

            bcrypt.compare(password, user.password, (err, didMatch) => {
                if(err) return reject(err);
                if(didMatch) {
                    resolve(user);
                } else {
                    reject({ message: 'Not authorized'});
                }
            });
        });
    });
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };