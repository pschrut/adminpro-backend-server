var express = require('express');
var mongoose = require('mongoose');

var app = express();
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) {
        throw err;
    }

    console.log('Base de datos online');
});

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

app.listen(3000, () => {
    return console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});