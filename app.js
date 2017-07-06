const config = require('./src/config/config');
const express = require('express');
const bodyParser = require('body-parser');
const { mongoose } = require('./src/db/mongoose');
const _ = require('lodash');
const { auth } = require('./src/middleware/auth');

// MODELS
const { User } = require('./src/models/user');

const app = express();

// MIDDLEWARES
app.use(bodyParser.json());

// ROUTES
app.get('/users', (req, res) => {
    User.find()
    .then(users => {
        res.send(users);
    })
    .catch(e => res.status(400).send(e));
});

app.get('/users/user-by-token', auth, (req, res) => {
    const now = new Date().getTime();
    const user = req.user;
    const timeSinceLastLogin = (now - user.last_login) / 1000;
    
    if(timeSinceLastLogin > 20) { // 1800 seconds = 30 min
        return Promise.reject({ message: 'Invalid session' });
    }
    res.send(req.user);
});

app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['name', 'password', 'email']);
    const user = new User(body);
    user.save()
    .then(() => user.generateAuthToken())
    .then(token => {
        res.header('x-auth', token).send(user);
    }).catch(e => res.status(400).send(e));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    User.findByCredentials(email, password)
    .then(user => {
        return user.generateAuthToken().then(token => {
            res.header('x-auth', token);
            res.send(user);
        });
    })
    .catch(e => {
        const status = e.status || 401;
        delete e['status'];
        res.status(status).send(e)
    })
});

app.listen(process.env.PORT, () => {
    console.log(`Running at http://localhost:${process.env.PORT}`);
});

module.exports = { app };