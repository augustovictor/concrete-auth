const { ObjectID } = require('mongodb');
const { User } = require('../models/user');
const jwt = require('jsonwebtoken');

const firstUserId = new ObjectID();

const users = [
    { 
        _id: firstUserId,
        name: 'User 1',
        email: 'user1@email.com',
        password: '123456',
        tokens: [{
            access: 'auth',
            token: jwt.sign({ _id: firstUserId, access: 'auth' }, process.env.JWT_SECRET).toString()
        }],
        phones: [
            { number: '8888-8888', code: 11},
            { number: '9999-9999', code: 83},
            { number: '7777-7777', code: 81}
        ]
    },
    {
        _id: new ObjectID(),
        name: 'User 2',
        password: '123456',
        email: 'user2@email.com'
    }
];

const populateUsers = done => {
    User.remove({})
    .then(() => {
        const firstUser = new User(users[0]).save();
        const secondUser = new User(users[1]).save();
        return Promise.all([firstUser, secondUser]);
    }).then(() => done()).catch(e => done(e));
};

module.exports = { users, populateUsers };