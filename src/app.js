const config       = require('./config/config');
const express      = require('express');
const bodyParser   = require('body-parser');
const { mongoose } = require('./db/mongoose');
const _            = require('lodash');
const { auth }     = require('./middleware/auth');

// MODELS
const { User } = require('./models/user');

const app = express();

// MIDDLEWARES
app.use(bodyParser.json({}));

// ROUTES
app.use('/', express.static('./docs'));

/**
 * @api {get} /users Request all users
 * @apiVersion 1.0.0
 * @apiGroup User
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * [
    {
        "_id": "595fa8acbd8c5472018fd011",
        "created_at": 1499441324857,
        "updated_at": 1499441329786,
        "last_login": 1499441324857,
        "tokens": [
            {
                "access": "auth",
                "token": "MyToken",
                "_id": "595fa8b1bd8c5472018fd053"
            }
        ]
    }
]
*/
app.get('/users', (req, res) => {
    User.find()
    .then(users => {
        res.json(users);
    })
    .catch(e => res.status(400).send(e));
});

/**
 * @api {get} /users/:id Request user by id
 * @apiVersion 1.0.0
 * @apiGroup User
 *
 * @apiHeader (Header) {String} x-auth User token.
 * 
 * @apiHeaderExample {json} Header-Example:
    { "x-auth": "Bearer MyToken" }
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
    "_id": "595ffb7d9965126ee3b5b73a",
    "created_at": 1499462471477,
    "updated_at": 1499462525974,
    "last_login": 1499462471477,
    "tokens": [
        {
            "access": "auth",
            "token": "MyToken",
            "_id": "595ffb7d9965126ee3b5b73b"
        }
    ]
}
 */
app.get('/users/:id', auth, (req, res) => {
    res.json(req.user);
});


/**
 * @api {post} /users Sign up
 * @apiVersion 1.0.0
 * @apiGroup User
 *
 * @apiHeader (Header) {String} x-auth User token.
 *
 * @apiParamExample {json} Request-Example:
    {
        "name": "Victor Augusto",
        "email": "findme@augustovictor.com",
        "password": "12345"
    }
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
    "_id": "595ffb7d9965126ee3b5b73a",
    "created_at": 1499462471477,
    "updated_at": 1499462525974,
    "last_login": 1499462471477,
    "tokens": [
        {
            "access": "auth",
            "token": "MyToken",
            "_id": "595ffb7d9965126ee3b5b73b"
        }
    ]
}
 */
app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['name', 'password', 'email']);
    const user = new User(body);
    user.save()
    .then(() => user.generateAuthToken())
    .then(token => {
        res.header('x-auth', token).json(user);
    }).catch(e => res.status(400).send(e));
});

/**
 * @api {post} /login Sign in
 * @apiVersion 1.0.0
 * @apiGroup User
 * 
 * @apiParamExample {json} Request-Example:
    {
        "email": "findme@augustovictor.com",
        "password": "12345"
    }
 * 
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
    "_id": "595fff95354cfb7c1aee38dd",
    "created_at": 1499463427948,
    "updated_at": 1499464309952,
    "last_login": 1499464309925,
    "tokens": [
        {
            "access": "auth",
            "token": "MyToken",
            "_id": "59600275380f590d62f51159"
        }
    ]
}
 */
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    User.findByCredentials(email, password)
    .then(user => {
        return user.generateAuthToken().then(token => {
            res.header('x-auth', token);
            res.json(user);
        });
    })
    .catch(e => {
        const status = e.status || 401;
        delete e.status;
        res.status(status).send(e);
    });
});

app.all('*', (req, res) => {
    res.status(404).json({ message: 'This route does not exist :)'});
});

app.listen(process.env.PORT, () => {
    console.log(`Running at port: ${process.env.PORT}`);
});

module.exports = { app };