const express = require('express')
const { verificaToken } = require('../middlewares/autenticacion')
const _ = require('underscore')

let app = express()

let Producto = require('../models/producto')

// ============================
// Obtener todos los productos
// ============================
app.get('/producto', verificaToken, (req, res) => {
    // Trae todos los productos
    // Populate: usuario y categoria
    // Paginado
    let desde = req.query.desde || 0
    desde = Number(desde)

    let limite = req.query.limite || 5
    limite = Number(limite)

    Producto.find( {disponible: true}, 'nombre precioUni descripcion disponible categoria usuario' )
            .sort('nombre')
            .populate('categoria', 'descripcion usuario')
            .populate('usuario', 'nombre email')
            .skip(desde)
            .limit(limite)
            .exec( (err, productos) =>{
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                
                Producto.count( {disponible: true}, ( err, conteo ) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }

                    res.json({
                        ok:true,
                        total: conteo,
                        productos
                    })
                })
            })
})

// ============================
// Obtener producto por ID
// ============================
app.get('/producto/:id', verificaToken, (req, res) => {
    // Traer el producto
    // Populate: usuario y categoria
    let id = req.params.id 

    Producto.findById( id )
            .populate('categoria', 'descripcion usuario')
            .populate('usuario', 'nombre email')
            .exec(( err, producto ) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                if (!producto) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'No existe producto con ese ID.'
                        }
                    });
                }

                res.json({
                    ok:true,
                    producto
                })
    })
})

// ============================
// Crear nuevo producto
// ============================
app.get('/producto/buscar/:termino', verificaToken, ( req, res ) => {

    let termino = req.params.termino

    let regex = new RegExp(termino, 'i')

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec(( err, productos ) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok:true,
                productos
            })
        })
})

// ============================
// Crear nuevo producto
// ============================
app.post('/producto', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario,
    })

    producto.save( (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !productoDB ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        })

    })
})

// ============================
// Actualizar producto
// ============================
app.put('/producto/:id', verificaToken, (req, res) => {
    // Grabar usuario
    // Grabar categoria existente
    let id = req.params.id
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'categoria'])
    body.usuario = req.usuario

    Producto.findByIdAndUpdate( id, body, { new: true, runValidators: true }, (err, productoDB) => {

        if ( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if( !productoDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe.'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    })
})

// ============================
// Borrar producto
// ============================
app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id
    let cambiaEstado = {
        disponible: false
    }
    
    Producto.findByIdAndUpdate( id, cambiaEstado, { new: true }, (err, productoBorrado) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !productoBorrado ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe.'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado,
            message: 'Producto borrado.'
        })
    })
})
module.exports = app