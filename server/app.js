const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db/db');

const app = express();

//Middleware
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

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