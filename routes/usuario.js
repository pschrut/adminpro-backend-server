var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var { verificaToken } = require('../middlewares/autenticacion');

var app = express();

app.get('/', (req, res) => {
    var desde = Number(req.query.desde) || 0;

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    err
                });
            }
            Usuario.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    data,
                    total: conteo
                });
            })
        });
});

app.put('/:id', verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                err
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

app.post('/', (req, res) => {
    var body = req.body;
    body.password = bcrypt.hashSync(body.password, 10);

    var usuario = new Usuario({
        ...body
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando usuario',
                err
            });
        }
        res.status(201).json({
            ok: true,
            usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});


app.delete('/:id', verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuario) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(200).json({
            ok: true,
            usuario
        });
    });
});

module.exports = app;