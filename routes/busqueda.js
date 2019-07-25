var express = require('express');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Uusario = require('../models/usuario');

var app = express();

app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var regex = new RegExp(req.params.busqueda, 'i');
    var promesa;

    switch (tabla) {
        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(regex);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(regex);
            break;
        default:
            return res.status(404).json({
                ok: false,
                err: 'No existe tabla'
            });
    }

    promesa.then(data => {
        res.json({
            ok: true,
            [tabla]: data
        })
    })
});

app.get('/todo/:busqueda', (req, res, next) => {
    var regex = new RegExp(req.params.busqueda, 'i');

    Promise.all([buscarHospitales(regex), buscarMedicos(regex), buscarUsuarios(regex)]).then((data) => {
        res.status(200).json({
            ok: true,
            hospitales: data[0],
            medicos: data[1],
            usuarios: data[2]
        });
    });
});

var buscarHospitales = (regex) => {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
    });
}

var buscarMedicos = (regex) => {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
            .exec((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
    });
}

var buscarUsuarios = (regex) => {
    return new Promise((resolve, reject) => {
        Uusario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
    });
}

module.exports = app;