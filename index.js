const express = require('express');
const app = express();
app.use(express.json());
const db = require('./database/connection')();


const user = require('./routes/user');
app.use('/api/createuser', user);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}..`));