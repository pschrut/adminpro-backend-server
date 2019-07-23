var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var app = express();

var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
app.post('/google', async(req, res) => {
    let token = req.body.token;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'token no valido',
                e
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al consultar'
            });
        }

        if (usuario) {
            if (usuario.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal'
                });
            } else {
                var token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario,
                    id: usuario._id,
                    token
                });
            }
        } else {
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            usuario.password = ':)';

            usuario.save((err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al consultar'
                    });
                }

                var token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario,
                    id: usuario._id,
                    token
                });
            });
        }
    });
});

app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuario) {
            return res.status(500).json({
                ok: false,
                mensaje: 'El usuario no existe',
                err
            });
        }

        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                err
            });
        }

        usuario.password = ':)';

        var token = jwt.sign({ usuario }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            mensaje: 'Login post correcto',
            usuario,
            id: usuario._id,
            token,
            body
        });
    });

});

module.exports = app;