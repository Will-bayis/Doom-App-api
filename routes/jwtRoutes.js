const express = require("express");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
const router = express.Router();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Secret pour signer et vérifier les tokens JWT (remplacez-le par votre secret réel)
const secret = process.env.TOKEN_SECRET;

// Route pour créer un token JWT et le stocker dans un cookie
app.get('/create-token', (req, res) => {
    const user = { id: 123, username: 'exampleUser' };
    const token = jwt.sign(user, secret, { expiresIn: '1h' });
    res.cookie('jwt', token, { httpOnly: true });
    res.send('Token créé et stocké dans le cookie.');
});

// Route pour vérifier le token JWT et renvoyer les informations de l'utilisateur
app.get('/check-token', (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        res.status(401).json({ message: 'Token manquant' });
    } else {
        jwt.verify(token, secret, (err, decodedToken) => {
            if (err) {
                res.status(401).json({ message: 'Token invalide' });
            } else {
                res.json({ user: decodedToken });
            }
        });
    }
});

// Serveur en cours d'écoute sur un port
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Serveur en cours d'écoute sur le port ${port}`);
});


module.exports = router;
