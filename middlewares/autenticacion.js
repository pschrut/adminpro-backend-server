var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

exports.verificaToken = (req, res, next) => {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });
}

exports.verificaAdminRole = (req, res, next) => {
    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            error: { message: 'No es administrador' }
        });
    }
}

exports.verificaAdminOMismoUsuario = (req, res, next) => {
    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            error: { message: 'No es administrador ni mismo usuario' }
        });
    }
}