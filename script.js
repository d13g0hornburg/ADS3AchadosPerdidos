//declaração das constantes para dependencias
const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { format } = require('date-fns');

//Arquivos estáticos dentro da pasta public

app.use(express.static('public'));
app.set('view engine', 'ejs');

//armazena os dados da conexao
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root99',
    database: 'apapp'
});
//conexão com o bd
connection.connect(function(err){
    if(err) {
        console.error("Erro de conexão!", err);
        return;
    }
    console.log("Conexão estabelecida!")
});

//capturar os dados do formulario html
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));

//rota index
app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html')
});

//rota sistema
app.get('/apoio', function(req, res){
    res.sendFile(__dirname+'/apoio.html')
});

//rota sistema
app.get('/sobre', function(req, res){
    res.sendFile(__dirname+'/sobre.html')
});

//rota cadastrarItem
app.get('/cadastrarItem', function(req, res){
    res.sendFile(__dirname+'/cadastrarItem.html')
});

//rota home
app.get('/home', function(req, res){
    res.sendFile(__dirname+'/home.html')
});

//rota login
app.post('/login', function(req, res){
    const login = req.body.login;
    const senha = req.body.senha;

    connection.query('SELECT * FROM login WHERE login=? and senha=?',[login, senha], function(error, results, fields){
        if(error){
            console.error('Erro ao executar a consulta ', error);
            res.status(500).send('Erro interno ao verificar credenciais');
            return;
        }
        if(results.length > 0){
            res.redirect('html/home.html');
         } else {
             res.status(401).send('Credenciais inválidas');
         }
    });
});

// Rota para lidar com o cadastro de objeto
app.post('/objeto', function(req, res){
    const descricao = req.body.objeto;
    const ambiente = req.body.ambiente;
    const professor = req.body.professor;
    const curso = req.body.curso;
    const data = req.body.data;
    const hora = req.body.hora;
    const encontrado = req.body.encontrado;

// Query para inserir os dados do objeto no banco de dados
connection.query('INSERT INTO objeto (descricao, ambiente, professor, curso, data, hora, encontrado) VALUES (?, ?, ?, ?, ?, ?, ?)', [descricao, ambiente, professor, curso, data, hora, encontrado], function(error, results, fields){
    if(error){
        console.error('Erro ao cadastrar objeto: ', error);
        res.status(500).send('Erro interno ao cadastrar objeto',error);
        return;
    }
    res.send('Objeto inserido com sucesso!');
    res.end();
    });
});

app.get('/listar', function(req, res){
    const listar = "SELECT * FROM objeto";

    connection.query(listar, function(err, rows){
        if(!err){
            console.log("Consulta realizada com sucesso!");
            res.render('listar', { objetos: rows, format });
        } else {
            console.log("Erro no relatório de Items", err);
            res.status(500).send("Erro no relatório de Items");
        }                
    });
});

app.get('/excluir/:id', function(req, res){

    const id = req.params.id;

    const excluir = "DELETE FROM objeto WHERE id = ?";

    connection.query(excluir, [id], function(err, result){
        if(!err){
            console.log("Objeto deletado!");
            res.redirect('/listar')
        } else {
            console.log("Erro ao deletar objeto", err)
            res.status(500).send("Erro ao deletar objeto");
        }
    })
})

app.get('/imprimir/:id', function(req, res) {
    const id = req.params.id;

    const query = 'SELECT * FROM objeto WHERE id = ?';
    connection.query(query, [id], function(err, results) {
        if (!err) {
            if (results.length > 0) {
                const objeto = results[0];
                res.render('imprimir', { objeto, format });
            } else {
                res.status(404).send('Objeto não encontrado');
            }
        } else {
            console.error('Erro ao buscar objeto para impressão: ', err);
            res.status(500).send('Erro interno ao buscar objeto para impressão');
        }
    });
});

//configuracao da aplicacao rodando no localhost, ouvindo a porta 8008
app.listen(8008, function(){
    console.log('Servidor rodando na url http://localhost:8008');
    });

