const { ObjectID } = require('mongodb');
const { User } = require('../models/user');
const jwt = require('jsonwebtoken');

const now = new Date().getTime();
const THIRTHY_MIN_AGO = new Date(now - 1000 * 60 * 30).getTime();

const firstUserId = new ObjectID();
const thirdUserId = new ObjectID();


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
    },
    {
        _id: thirdUserId,
        name: 'User 3',
        email: 'user3@email.com',
        password: '123456',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: thirdUserId, access: 'auth'}, process.env.JWT_SECRET).toString()
        }],
        last_login: THIRTHY_MIN_AGO

    }
];

const populateUsers = done => {
    User.remove({})
    .then(() => {
        const firstUser = new User(users[0]).save();
        const secondUser = new User(users[1]).save();
        const thirdUser = new User(users[2]).save();
        return Promise.all([firstUser, secondUser, thirdUser]);
    }).then(() => done()).catch(e => done(e));
};

module.exports = { users, populateUsers };