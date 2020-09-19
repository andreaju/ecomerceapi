const mysql = require('../mysql').pool

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


exports.login = (req, res, next)=>{
    mysql.getConnection((error, conn) => {
        if(error){ return res.status(500).send({ message: error})}
        const query = 'select * from usuarios where email = ?'
        conn.query(query,[req.body.email], (error, results, fields)=>{
            conn.release()
            if (error){ return res.status(500).send({ message: error})}
            if(results < 1){ return res.status(401).send({ message: 'Falha na autenticação'})}

            bcrypt.compare(req.body.senha, results[0].senha, (err, result)=>{
                if (err){ return res.status(401).send({ message: 'Falha na autenticação'})}
                if (result){ 
                    const JWT_KEY = 'segredo'
                    const token = jwt.sign({
                        id_usuario: results[0].id_usuario,
                        email: results[0].email,
                    }, 
                    JWT_KEY,
                    {
                        expiresIn: '1h'
                    }) 
                    
                    return res.status(200).send({ 
                        message: 'Autenticado com sucesso',
                        token: token
                    })
                }
                return res.status(401).send({ message: 'Falha na autenticação'})
            })
        })
    })
}

exports.cadastro = (req, res, next) =>{
    mysql.getConnection((error, conn) => {
        if (error){ return res.status(500).send({ message: error})}
        conn.query('select * from usuarios where email=?',[req.body.email],
         (erro, results)=>{
             if (error){ return res.status(500).send({ message: error})}
             if (results.length > 0){
                 return res.status(409).send({ message:"usuario já cadastrado"})
             } else{
                bcrypt.hash( req.body.senha, 10, (errBcrypt, hash) => {
                    if (errBcrypt){ return res.status(500).send({ message: errBcrypt})}
                    conn.query('insert into usuarios(email, senha) values (?,?)'
                                , [req.body.email, hash] 
                                , (erro, results) => {
                                    conn.release()
                                    if (erro){ return res.status(500).send({ message: erro})}
        
                                    const response = { 
                                        mensagem: 'Usuario cadastrado com sucesso',
                                        usuarioCriado: {
                                            id_usuario: results.inserteId,
                                            email: req.body.email,
                                        }
                                    }
        
                                    return res.status(201).send(response)
        
                                })
                } )
             }
         })

    })
}