const express = require('express')
const router = express.Router()
const mysql = require('../mysql').pool
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './uploads/')
    }, 
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
})

//RETORNA TODOS OS PRODUTOS
router.get('/', (req, res, next)=>{
    mysql.getConnection((error, conn)=>{
        if (error){ return res.status(500).send({ message: error})}
        conn.query(
            'select * from produtos', 
            (erro, result, fields)=>{
                if (erro){ return res.status(500).send({ message: erro})}
                
                const response = {
                    quantidade: result.length,
                    produtos: result.map( prod => {
                        return {
                            id_produto: prod.id_produto,
                            nome: prod.nome,
                            preco: prod.preco,
                            request: { 
                                tipo: 'GET',
                                descricao: 'retorna os detalhes de um produto especifico', 
                                url: 'http://localhost:3000/produtos/'+prod.id_produto
                            }
                        }
                    })
                }
                
                return res.status(200).send(response)
            }
        )
    })
   
})

// INSERE UM PRODUTO
router.post('/', (upload.single('produto_imagem')),(req, res, next)=>{
    console.log(req.file)
    mysql.getConnection((error, conn) => {
        conn.query(
            "insert into produtos (nome, preco, produto_imagem) values (?, ?, ?)",
            [
                req.body.nome, 
                req.body.preco, 
                req.file.path
            ],
            (error, result, field)=>{
                conn.release()
                if(error){return res.status(500).send({ error: error , response: null })}
                const response = {
                    mensagem: 'produto inserido com sucesso',
                    produtoCriado: {
                            id_produto: result.id_produto,
                            nome: req.body.nome,
                            preco: req.body.preco,
                            request: { 
                                tipo: 'GET',
                                descricao: 'Retorna todo os produtos', 
                                url: 'http://localhost:3000/produtos'
                            }
                        }
                }
                res.status(201).send(response)
            }
        )
    })
})

// RETORNA OS DADOS DE UM PRODUTOS
router.get('/:id_produto', (req, res, next)=>{
    mysql.getConnection((error, conn)=>{
        if (error){ return res.status(500).send({ message: error})}
        conn.query(
            'select * from produtos where id_produto=?', 
            [req.params.id_produto],
            (erro, result, fields) => {
                if (erro){return res.status(500).send({ message: erro})}

                if (result.length == 0) {return res.status(404).send({ message: 'Produto não encontrado para esse ID'})}

                const response = {
                    mensagem: 'Retorna um produto pesquisado',
                    produto: {
                            id_produto: result[0].id_produto,
                            nome: result[0].nome,
                            preco: result[0].preco,
                            request: { 
                                tipo: 'GET',
                                descricao: 'Retorna todos os produtos', 
                                url: 'http://localhost:3000/produtos'
                            }
                        }
                }

                return res.status(200).send(response)
            }
        )
    })

})

//ALTERA UM PRODUTO
router.patch('/',(req, res, next)=>{
    mysql.getConnection((error, conn) => {
        conn.query(
            `UPDATE PRODUTOS
                SET nome = ?,
                    preco = ?
                WHERE id_produto = ? `,
            [req.body.nome, req.body.preco, req.body.id_produto],
            (error, resulresulttado, field)=>{
                conn.release()
                if(error){return res.status(500).send({error: error })}
                const response = {
                    mensagem: 'produto atualizado com sucesso',
                    produtoAtualizado: {
                            id_produto: req.body.id_produto,
                            nome: req.body.nome,
                            preco: req.body.preco,
                            request: { 
                                tipo: 'GET',
                                descricao: 'Retorna os detalhes de um produto especifico', 
                                url: 'http://localhost:3000/produtos/'+req.body.id_produto
                            }
                        }
                }
                res.status(202).send(response)
            }
        )
    })
})

//REMOVER UM PRODUTO
router.delete('/', (req, res, next)=>{
    mysql.getConnection((error, conn) => {
        conn.query(
            `DELETE FROM PRODUTOS WHERE id_produto = ? `, 
            [req.body.id_produto],
            (error, resultado, field)=>{
                conn.release()
                if(error){return res.status(500).send({ error: error})}
                const response = {
                    mensagem: 'produto removido com sucesso',
                    request: { 
                        tipo: 'POST',
                        descricao: 'Insere um produto', 
                        url: 'http://localhost:3000/produtos/',
                        body:{
                            nome: 'String',
                            preco: 'Number'
                        }
                    }
                   
                }
                return res.status(202).send(response)
            }
        )
    })
})

module.exports = router