const request = require('supertest');
const { app } = require('../../src/app');
const jwt = require('jsonwebtoken');
const expect = require('expect');
const { User } = require('../models/user');
const { users, populateUsers } = require('./seed');
const _ = require('lodash');

beforeEach(populateUsers);

describe('GET /users', () => {
    it('should return a set of users', done => {
        request(app)
        .get('/users')
        .expect(200)
        .expect(res => {
            expect(res.body).toBeA('object');
            expect(res.body.length).toBe(3);
        }).end(done);
    });
});

describe('GET /users/:id', () => {
    it('should return user if token is valid', done => {
        const { _id, email } = users[0];
        const token = `${process.env.TOKEN_PREFIX}${users[0].tokens[0].token}`;

        request(app)
        .get(`/users/${_id}`)
        .set('x-auth', token)
        .expect(200)
        .expect(res => {
            expect(res.body).toBeA('object');
            expect(res.body._id).toBe(_id);
        }).end(done);
    });

    it('should deny access if token not present', done => {
        request(app)
        .get(`/users/${users[0]._id}`)
        .expect(401)
        .expect(res => {
            expect(res.body).toBeA('object');
            expect(res.header['x-auth']).toNotExist();
            expect(res.body.message).toBe('Not authorized');
        })
        .end(done);
    });

    it('should deny access if token is wrong', done => {
        request(app)
        .get(`/users/${users[0]._id}`)
        .set('x-auth', '12345')
        .expect(401)
        .expect(res => {
            expect(res.body).toBeA('object');
            expect(res.header['x-auth']).toNotExist();
            expect(res.body.message).toBe('Not authorized');
        }).end(done);
    });

    it('should deny access if token was generated 30 min ago or more', done => {
        const token = `${process.env.TOKEN_PREFIX}${users[2].tokens[0].token}`;
        request(app)
        .get(`/users/${users[2]._id}`)
        .set('x-auth', token)
        .expect(401)
        .expect(res => {
            expect(res.body).toBeA('object');
            expect(res.body.message).toBe('Invalid session');
        })
        .end(done);
    });
});

describe('POST /users', () => {
    it('should insert a valid user', done => {
        const mockUser = Object.create(users[0]);
        mockUser.email = 'mockuser@email.com';
        
        request(app)
        .post('/users')
        .send(mockUser)
        .expect(200)
        .expect(res => {
            expect(res.body).toBeA('object');
            expect(res.header['x-auth']).toExist();
            expect(res.body.password).toNotExist();
            expect(res.body).toIncludeKeys(['_id', 'created_at', 'updated_at', 'last_login', 'tokens']);
        }).end((err, res) => {
            if(err) return done(err);

            User.findById(mockUser._id).then(user => {
                expect(user).toExist();
                expect(user.password).toNotBe(mockUser.password);
                expect(user.email).toExist();
                done();
            }).catch(e => done(e));
        });
    });

    it('should not insert invalid user', done => {
        request(app)
        .post('/users')
        .send({})
        .expect(400)
        .end(done);
    });

    it('should not insert existing email', done => {
        request(app)
        .post('/users')
        .send(users[0])
        .expect(400)
        .end(done);
    });

    it('should not accept invalid email', done => {
        const mockUser = Object.create(users[0]);
        mockUser.email = '';
        request(app)
        .post('/users')
        .send(mockUser)
        .expect(400)
        .end(done);
    });
});

describe('POST /login', () => {
    it('should return user with a different token if logged successfully', done => {
        const { email, password } = Object.create(users[0]);
        request(app)
        .post('/login')
        .send({ email, password })
        .expect(200)
        .expect(res => {
            expect(res.body).toBeA('object');
            expect(res.header).toIncludeKey('x-auth');
            expect(res.body).toIncludeKeys(['_id', 'created_at', 'updated_at', 'last_login', 'tokens']);
            expect(res.body.tokens[0].token).toNotBe(users[0].tokens[0].token);
        }).end(done);
    });

    it('should return not authorized on invalid password', done => {
        const { email } = users[0];
        const password = '';
        request(app)
        .post('/login')
        .send({ email, password })
        .expect(401)
        .expect(res => {
            expect(res.body).toBeA('object');
            expect(res.body.message).toBe('Not authorized');
        })
        .end(done);
    });

    it('should return invalid credentials on invalid email', done => {
        const email = 'wrongEmail@email.com';
        const password = '12345';
        request(app)
        .post('/login')
        .send({ email, password })
        .expect(404)
        .expect(res => {
            expect(res.body).toBeA('object');
            expect(res.body.message).toBe('Invalid credentials');
        })
        .end(done);
    });
});

describe('/docs', () => {
    it('should return 200 for docs page request', done => {
        request(app)
        .get('/docs/index.html')
        .expect(200)
        .end(done);
    });
});

describe('* /*', () => {
    it('should return a custom message on routes not found', done => {
        request(app)
        .get('/abc')
        .expect(404)
        .expect(res => {
            expect(res.body).toBeA('object');
            expect(res.body.message).toBe('This route does not exist :)');
        }).end(done);
    });
});