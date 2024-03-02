require('./utils/config')();
const express = require('express');
const app = express();
// app.use(bodyParser.json());
app.use(express.json());
const db = require('./database/connection')();


const user = require('./routes/user');
// const sendOtp = require('./routes/user');
// app.use('/api/createuser', user);
app.use('/api/user',user);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}..`));