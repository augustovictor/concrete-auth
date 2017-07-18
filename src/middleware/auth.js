const { User } = require('../models/user');

const auth = (req, res, next) => {
    let token = req.header('x-auth');
    if(!token || (token && token.indexOf(process.env.TOKEN_PREFIX) === -1)) {
        return res.status(401).send({message: 'Not authorized'});
    }

    token = token.split(process.env.TOKEN_PREFIX)[1];

    User.findByToken(token)
    .then(user => {
        const now = new Date().getTime();
        const timeSinceLastLogin = (now - user.last_login) / 1000;
        const userId = user._id;

        if(!user) {
            return Promise.reject();
        }

        // if(req.params.id !== userId) {
        //     return Promise.reject();
        // }
        
        if(timeSinceLastLogin > 1800) { // 1800 seconds = 30 min
            return res.status(401).json({ message: 'Invalid session' });
        }

        req.user = user;
        req.token = token;
        next();
    }).catch(e => {
        res.status(401).send({message: 'Not authorized'})
    });
};

module.exports = { auth };