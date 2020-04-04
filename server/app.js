const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const db = require('./db/db');

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
    saveUninitialized: true,
    cookie: { 
        maxAge: 60*1000,
        httpOnly: false
    }
}));

app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/scrape-list', require('./routes/scrape_list'));
app.use('', require('./routes/auth'));

app.get('/', (req, res) => {
    res.send('This is home...');
});

const port = process.env.PORT || 5000;

db.connect();

app.listen(port, () => console.log(`Sever started on port ${port}`));