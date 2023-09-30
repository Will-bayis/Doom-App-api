const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

module.exports.checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                // Définissez le domaine complet ici
                res.cookie('jwt', '', { maxAge: 5 * 60 * 1000, domain: 'doom-app-login.onrender.com', path: '/' });
                next();
            } else {
                let user = await UserModel.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};


module.exports.requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                // En cas d'erreur de vérification JWT, renvoyer une réponse 401 (Non autorisé)
                res.status(401).json({ error: 'Token invalide' });
            } else {
                // Si la vérification est réussie, poursuivre la demande
                console.log(decodedToken.id);
                next();
            }
        });
    } else {
        // Si aucun token n'est présent, renvoyer une réponse 401 (Non autorisé)
        res.status(401).json({ error: 'Token manquant' });
    }
};

