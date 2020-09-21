const express = require('express')
const app = express()

const rotaProdutos = require('./routes/produtos')
const rotaPedidos = require('./routes/pedidos')
const rotaUsuarios = require('./routes/usuarios')

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false })) // apenas dados simples asdasd
app.use(bodyParser.json()) // apenas formato json de entrada no body asdad

app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin','*')
    res.header(
        'Access-Control-Allow-Header',
        'Origin, Content-Type, X-Requested-With, Accept, Authorization'
        )
    if(req.method==="OPTIONS"){
        res.header('Access-Control-Allow-Methods', 'PUT, DELETE, PATCH, POST, GET')
        return res.status(200).send({})
    }

    next()
})

app.use('/produtos', rotaProdutos)
app.use('/pedidos', rotaPedidos)
app.use('/usuarios', rotaUsuarios)



//quando não encontra rota entra aqui
app.use((req, res, next)=>{
    const erro = new Error("não encontrado")
    erro.status = 404
    next(erro)
})

app.use((erro, req, res, next)=>{
    res.status(erro.status || 500 )
    return res.send(
        { 
            erro:{ 
                message: erro.message
            }
        }
    )
})

module.exports = app