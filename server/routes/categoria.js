const express = require('express')
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion')
const _ = require('underscore')

let app = express()

let Categoria = require('../models/categoria')

// ============================
// Obtener todas las categorias
// ============================
app.get('/categoria', (req, res) => {
    let desde = req.query.desde || 0
    desde = Number(desde)

    let limite = req.query.limite || 5
    limite = Number(limite)

    Categoria.find({})
            .sort('descripcion')
            .populate('usuario', 'nombre email')
            .skip(desde)
            .limit(limite)
            .exec( (err, categorias) =>{
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                Categoria.count( { }, ( err, conteo ) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }

                    res.json({
                        ok:true,
                        total: conteo,
                        categorias
                    })
                })
            })
})

// ============================
// Obtener una categoría por ID
// ============================
app.get('/categoria/:id', (req, res) => {
    let id = req.params.id 

    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe categoría con ese ID.'
                }
            });
        }

        res.json({
            ok:true,
            categoria
        })
    })
})

// ============================
// Crear nueva categoria
// ============================
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario,
    })

    categoria.save( (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !categoriaDB ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })

    })
})

// ============================
// Actualizar una categoria
// ============================
app.put('/categoria/:id', [verificaToken], (req, res) => {
    let id = req.params.id
    let body = _.pick(req.body, ['descripcion'])
    body.usuario = req.usuario

    Categoria.findByIdAndUpdate( id, body, { new: true, runValidators: true }, (err, categoriaDB) => {

        if ( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if( !categoriaDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

// ============================
// Delte una categoria
// ============================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    //Solo un administrador puede borrar categorías, solo actualizar el estado
    let id =  req.params.id

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
    //Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !categoriaBorrada ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado.'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrada
        })
    })
})

module.exports = app;