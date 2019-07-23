var express = require('express');
var Hospital = require('../models/hospital');
var { verificaToken } = require('../middlewares/autenticacion');

var app = express();

app.get('/', (req, res) => {
    var desde = Number(req.query.desde) || 0;
    Hospital.find({}).populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec((err, data) => {
            if (err || data.length === 0) {
                return res.status(404).json({
                    ok: false,
                    err
                });
            }

            Hospital.count({}, (err, count) => {
                res.json({
                    ok: true,
                    data,
                    total: count
                });
            })
        });
});

app.post('/', verificaToken, (req, res) => {
    var body = req.body;

    body.usuario = req.usuario._id;

    var hospital = new Hospital({
        ...body
    });

    hospital.save((err, data) => {
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

    Hospital.findById(id, (err, data) => {
        if (err || data.length === 0) {
            return res.json(500).json({
                ok: false,
                err: (err || 'No se encuentra el hospital')
            });
        }

        data.nombre = body.nombre;
        data.img = body.img;
        data.usuario = body.usuario;

        data.save((err, data) => {
            if (err) {
                return res.json(500).json({
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

    Hospital.findByIdAndRemove(id, (err, data) => {
        if (err || data.length === 0) {
            return res.json(500).json({
                ok: false,
                err: (err || 'No se encuentra el hospital')
            });
        }
        res.json({
            ok: true,
            data
        });
    });
});

module.exports = app;