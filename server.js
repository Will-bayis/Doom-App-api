const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require('cookie-parser');
require("dotenv").config();
const { checkUser, requireAuth } = require('./middleware/auth.middleware');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const cors = require('cors'); //Pour gérer qui peut avoir accès à notre Api

const app = express();
const port = 5000;

// Pour notre api
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}
app.use(cors(corsOptions));

// connection à la DB
connectDB();


// Middleware
app.use(express.json()); // Remplace bodyParser.json()
app.use(express.urlencoded({ extended: true })); // Remplace bodyParser.urlencoded()
app.use(cookieParser());


// jwt
app.get('*', checkUser);
app.get('/jwt', requireAuth, (req, res) => {
    res.status(200).send(res.locals.user._id)
})


// Routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);



//lancer le serveur
app.listen(port, () => console.log("Listening on port " + port));
