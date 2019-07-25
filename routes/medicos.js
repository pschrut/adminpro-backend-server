var Medico = require('../models/medico');
var { verificaToken } = require('../middlewares/autenticacion');
var express = require('express');

var app = express();

app.get('/', (req, res) => {
    var desde = Number(req.query.desde) || 0;
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('hospital')
        .populate('usuario', 'nombre email')
        .exec((err, data) => {
            if (err || data.length === 0) {
                return res.status(404).json({
                    ok: false,
                    err: (err || 'No hay datos')
                });
            }
            Medico.count({}, (err, count) => {
                res.json({
                    ok: true,
                    data,
                    total: count
                });
            });
        });
});

app.get('/:id', (req, res) => {
    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }

            if (!data) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + ' no existe',
                    errors: { message: 'No existe un medico con ese ID' }
                });
            }

            res.json({
                ok: true,
                medico: data
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