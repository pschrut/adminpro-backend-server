var express = require('express');
var fs = require('fs');
var fileUpload = require('express-fileupload');
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var app = express();

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: 'Tipo no valido'
        });
    }
    if (!req.files) {
        return res.status(500).json({
            ok: false,
            err: 'Debe de seleccionar una imagen'
        });
    }

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.')
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(500).json({
            ok: false,
            err: 'Extension no valida'
        });
    }

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
    });

    subirPorTipo(tipo, id, nombreArchivo, res);
});

var subirPorTipo = (tipo, id, nombreArchivo, res) => {
    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, data) => {
                if (!data) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Usuario no existe'
                    })
                }
                unlinkOldImage(data.img, tipo);
                data.img = nombreArchivo;

                data.save((err, usuario) => {
                    return res.json({
                        ok: true,
                        mensaje: 'Imagen actualizada',
                        usuario
                    });
                });
            });
            break;
        case 'medicos':
            Medico.findById(id, (err, data) => {
                if (!data) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Usuario no existe'
                    });
                }
                unlinkOldImage(data.img, tipo);
                data.img = nombreArchivo;

                data.save((err, medico) => {
                    return res.json({
                        ok: true,
                        mensaje: 'Imagen actualizada',
                        medico
                    });
                });
            });
            break;
        case 'hospitales':
            Hospital.findById(id, (err, data) => {
                if (!data) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Usuario no existe'
                    })
                }
                unlinkOldImage(data.img, tipo);
                data.img = nombreArchivo;

                data.save((err, hospital) => {
                    return res.json({
                        ok: true,
                        mensaje: 'Imagen actualizada',
                        hospital
                    });
                });
            });
            break;
        default:
            return res.status(400).json({
                ok: false
            });

    }
}

var unlinkOldImage = (img, tipo) => {
    if (img) {
        var pathViejo = `./uploads/${tipo}/${img}`;

        if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo, (err) => {});
        }
    }
}

module.exports = app;