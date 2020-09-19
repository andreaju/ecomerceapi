const mysql = require('../mysql').pool


exports.getPedidos =  (req, res, next)=>{
    mysql.getConnection((error, conn)=>{
        if (error){ return res.status(500).send({ message: error})}
        conn.query(
            `
                SELECT ped.id_pedido, ped.quantidade, prod.id_produto, prod.nome, prod.preco 
                FROM pedidos as ped
                JOIN produtos as prod on prod.id_produto = ped.id_produto
            `, 
            (erro, result, fields)=>{
                if (erro){ return res.status(500).send({ message: erro})}
                
                const response = {
                    quantidade: result.length,
                    pedidos: result.map( pedido => {
                        return {
                            id_pedido: pedido.id_pedido,
                            quantidade: pedido.quantidade,
                            produto: {
                                id_produto: pedido.id_produto,
                                nome: pedido.nome,
                                preco: pedido.preco,
                            },
                            request: { 
                                tipo: 'GET',
                                descricao: 'retorna os detalhes de um pedido especifico', 
                                url: 'http://localhost:3000/pedidos/'+pedido.id_pedido
                            }
                        }
                    })
                }
                
                return res.status(200).send(response)
            }
        )
    })
}


exports.postPedidos = (req, res, next)=>{
    mysql.getConnection((error, conn) => {
        conn.query(
            "insert into PEDIDOS (id_produto, quantidade) VALUES (?, ?)",
            [req.body.id_produto, req.body.quantidade],
            (error, result, field)=>{
                conn.release()
                if(error){return res.status(500).send({ error: error , response: null })}
                const response = {
                    mensagem: 'pedido inserido com sucesso',
                    pedidoCriado: {
                            id_pedido: result.id_pedido,
                            id_produto: req.body.id_produto,
                            quantidade: req.body.quantidade,
                            request: { 
                                tipo: 'GET',
                                descricao: 'Retorna todo os pedidos!', 
                                url: 'http://localhost:3000/pedidos'
                            }
                        }
                }
                res.status(201).send(response)
            }
        )
    })
}

exports.getUmPedido = (req, res, next)=>{
    mysql.getConnection((error, conn)=>{
        if (error){ return res.status(500).send({ message: error})}
        conn.query(
            `SELECT ped.id_pedido, ped.quantidade, prod.id_produto, prod.nome, prod.preco 
            FROM pedidos as ped
            JOIN produtos as prod on prod.id_produto = ped.id_produto
            WHERE ped.id_pedido = ?
            `,
            [req.params.id_pedido],
            (erro, result, fields) => {
                if (erro){return res.status(500).send({ message: erro})}

                if (result.length == 0) {return res.status(404).send({ message: 'Pedido não encontrado para esse ID'})}

                const response = {
                    mensagem: 'Retorna um pedido pesquisado',
                    pedido: {
                            id_pedido: result[0].id_pedido,
                            quantidade: result[0].quantidade,
                            produto:{
                                id_produto: result[0].id_produto,
                                nome:result[0].nome,
                                preco: result[0].preco,
                            },
                            request: { 
                                tipo: 'GET',
                                descricao: 'Retorna todos os pedidos', 
                                url: 'http://localhost:3000/pedidos'
                            }
                        }
                }
                return res.status(200).send(response)
            }
        )
    })
}

exports.deletePedido = (req, res, next)=>{
    mysql.getConnection((error, conn) => {
        conn.query(
            `DELETE FROM PEDIDOS WHERE id_pedido = ? `, 
            [req.body.id_pedido],
            (error, resultado, field)=>{
                conn.release()
                if(error){return res.status(500).send({ error: error})}
                const response = {
                    mensagem: 'pedido removido com sucesso',
                    request: { 
                        tipo: 'POST',
                        descricao: 'Insere um pedido', 
                        url: 'http://localhost:3000/pedidos/',
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
}
