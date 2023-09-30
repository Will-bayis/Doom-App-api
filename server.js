const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require('cookie-parser');
require("dotenv").config();
const path = require("path")
const mongoose = require("mongoose");
const { checkUser, requireAuth } = require('./middleware/auth.middleware');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
mongoose.set("strictQuery", true);
const jwtRoutes = require('./routes/jwtRoutes'); // les nouvelles routes

const cors = require("cors"); //Pour gérer qui peut avoir accès à notre Api

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: 'https://doom-app-login.onrender.com', // Remplacez par le domaine de votre application
    credentials: true, // Permet les cookies et les en-têtes d'autorisation
}));


app.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.send("API is running..");
});



// connection à la DB
connectDB();


// Middleware
app.use(express.json()); // Remplace bodyParser.json()
app.use(express.urlencoded({ extended: true })); // Remplace bodyParser.urlencoded()
app.use(cookieParser());


// jwt
app.get('*', checkUser);
app.get('/jwtid', requireAuth, (req, res) => {
    res.status(200).send(res.locals.user._id)
});



// Routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);


// Utilisez les nouvelles routes
app.use('/jwt', jwtRoutes);



//lancer le serveur
app.listen(port, () => console.log("Listening on port " + port));
