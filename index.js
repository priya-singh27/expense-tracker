require('./utils/config')();
const express = require('express');
const app = express();
// app.use(bodyParser.json());
app.use(express.json());
const db = require('./database/connection')();

const expense = require('./routes/expense');
const user = require('./routes/user');
const splitBill = require('./routes/splitBill');

app.use('/api/user', user);
app.use('/api/expense', expense);
app.use('/api/splitbill', splitBill);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}..`));