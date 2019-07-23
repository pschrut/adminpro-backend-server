var express = require('express');
var mongoose = require('mongoose');
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalesRoutes = require('./routes/hospitales');
var medicosRoutes = require('./routes/medicos');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true }, (err, res) => {
    if (err) {
        throw err;
    }
    console.log('Base de datos online');
});
mongoose.set('useCreateIndex', true);

app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospitales', hospitalesRoutes);
app.use('/medicos', medicosRoutes);
app.use('/', appRoutes);

app.listen(3000, () => {
    return console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});