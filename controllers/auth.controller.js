const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { singUpErrors, signInErrors } = require('../utils/errors.utils');


const maxAge = 60 * 60 * 1000; // 1h heure
const createToken = (id) => {
    return jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    })
};


module.exports.signUp = async (req, res) => {
    const { pseudo, email, password } = req.body

    try {
        const user = await UserModel.create({ pseudo, email, password });
        res.status(200).json({ user: user._id });
    }
    catch (err) {
        const errors = singUpErrors(err);
        res.status(200).send({ errors })
    }
}


module.exports.signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.login(email, password);
        const token = createToken(user._id);
        
        // Définir le domaine et le chemin du cookie pour Render
        const cookieOptions = {
            httpOnly: true,
            maxAge, 
            domain: 'https://doom-app-login.onrender.com', 
            path: '/', // Utilisez '/' pour que le cookie soit accessible depuis toutes les routes
        };

        res.cookie('jwt', token, cookieOptions);
        res.status(200).json({ user: user._id });
    } catch (err) {
        const errors = signInErrors(err);
        res.status(200).json({ errors });
    }
};


module.exports.logout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 2 * 60 * 1000 }); // 2 minutes
    res.redirect('/');
}


