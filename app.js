const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const db = require('./db/db');
const path = require('path');

const app = express();

require('./config/passport')(passport);

//Middleware
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors
    (
        {
            origin: 'http://localhost:8080',
            credentials: true 
        }
    )
);

app.use(session({
    name: 'session_id',
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24*60*60*1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

db.connect();

//Routes
app.use('/cards', require('./routes/cards'));
app.use('/users', require('./routes/users'));
app.use('/scrape-list', require('./routes/scrape_list'));
app.use('', require('./routes/auth'));

/* app.get('/', (req, res) => {
    res.send('This is home...');
}); */

if(process.env.NODE_ENV === 'production') {
    //Set static folder
    app.use(express.static('client/dist'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
    });
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Sever started on port ${port}`));