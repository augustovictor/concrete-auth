const { User } = require('../models/user');

const auth = (req, res, next) => {
    const token = req.header('x-auth');
    User.findByToken(token)
    .then(user => {
        const now = new Date().getTime();
        const timeSinceLastLogin = (now - user.last_login) / 1000;
        const userId = user._id.toHexString();

        if(!user) return Promise.reject();
        if(req.params.id !== userId) return Promise.reject();
        
        if(timeSinceLastLogin > 1800) { // 1800 seconds = 30 min
            return res.status(401).json({ message: 'Invalid session' });
        }

        req.user = user;
        req.token = token;
        next();
    }).catch(e => res.status(401).send({message: 'Not authorized'}));
};

module.exports = { auth };