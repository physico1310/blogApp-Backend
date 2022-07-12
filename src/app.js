const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const PORT = 1234

app.use(express.json())
app.use(bodyParser.json());

app.use('/', require('../router/routes'))


app.listen(PORT, () => {
    console.log('server connected to PORT', PORT);
})