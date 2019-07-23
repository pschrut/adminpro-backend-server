var Medico = require('../models/medico');
var { verificaToken } = require('../middlewares/autenticacion');
var express = require('express');

var app = express();

app.get('/', (req, res) => {
    Medico.find({}, (err, data) => {
        if (err || data.length === 0) {
            return res.status(404).json({
                ok: false,
                err: (err || 'No hay datos')
            });
        }
        res.json({
            ok: true,
            data
        });
    });
});

app.post('/', verificaToken, (req, res) => {
    var body = req.body;
    body.usuario = req.usuario._id;

    var medico = new Medico({
        ...body
    });

    medico.save((err, data) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            data
        });
    });
});

app.put('/:id', verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    body.usuario = req.usuario._id;

    Medico.findById(id, (err, data) => {
        if (err || data.length === 0) {
            return res.status(500).json({
                ok: false,
                err: err || 'No se encontro'
            });
        }

        data.nombre = body.nombre;
        data.img = body.img;
        data.usuario = body.usuario;
        data.hospital = body.hospital;

        data.save((err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                data
            });
        });
    });
});

app.delete('/:id', verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, data) => {
        if (err || data.length === 0) {
            return res.status(500).json({
                ok: false,
                err: err || 'No se encuentra'
            });
        }
        res.json({
            ok: true,
            data
        });
    });
});

module.exports = app;