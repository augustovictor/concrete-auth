const request = require('supertest');
const { app } = require('../../app');
const jwt = require('jsonwebtoken');
const expect = require('expect');
const { User } = require('../models/user');
const { users, populateUsers } = require('./seed');

beforeEach(populateUsers);

describe('GET /users', () => {
    it('should return an array of users', done => {
        request(app)
        .get('/users')
        .expect(200)
        .expect(res => {
            expect(res.body).toBeA('array');
            expect(res.body.length).toBe(2);
        }).end(done);
    });
});

describe('GET /users/user-by-token', () => {
    it('should return user if token is valid', done => {
        const { _id, email } = users[0];
        const token = users[0].tokens[0].token;

        request(app)
        .get('/users/user-by-token')
        .set('x-auth', token)
        .expect(200)
        .expect(res => {
            expect(res.body._id).toBe(_id.toHexString());
        }).end(done);
    });

    it('should deny access if token not present', done => {
        request(app)
        .get('/users/user-by-token')
        .expect(401)
        .expect(res => {
            expect(res.header['x-auth']).toNotExist();
        })
        .end(done);
    });

    it('should deny access if token is invalid', done => {
        request(app)
        .get('/users/user-by-token')
        .set('x-auth', '123')
        .expect(401)
        .expect(res => {
            expect(res.header).toIncludeKey('x-auth')
        }).end(done);
    });
});

describe('POST /login', () => {
    it('should return user if logged successfully', done => {
        const { email, password } = users[0];
        request(app)
        .post('/login')
        .send({ email, password })
        .expect(200)
        .expect(res => {
            expect(res.header).toIncludeKey('x-auth');
            expect(res.body).toIncludeKeys(['_id', 'created_at', 'updated_at', 'last_login', 'tokens']);
        }).end(done);
    });

    it('should return not authorized on invalid password', done => {
        const { email } = users[0];
        const password = '';
        request(app)
        .post('/login')
        .send({ email, password })
        .expect(401)
        .end(done);
    });

    it('should return invalid credentials on invalid email', done => {
        const email = 'wrongEmail@email.com';
        const password = '12345';
        request(app)
        .post('/login')
        .send({ email, password })
        .expect(404)
        .end(done);
    });
});

describe('POST /users', () => {
    it('should insert a valid user', done => {
        const mockUser = users[0];
        mockUser.email = 'mockuser@email.com';
        
        request(app)
        .post('/users')
        .send(mockUser)
        .expect(200)
        .expect(res => {
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
        const mockUser = users[0];
        mockUser.email = '';
        request(app)
        .post('/users')
        .send(mockUser)
        .expect(400)
        .end(done);
    });
});