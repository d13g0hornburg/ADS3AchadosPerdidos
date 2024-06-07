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
try{
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
    
}catch (error){
    console.error("Erro ao criar uma conexão estavel", error);
}

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
    try{
        const login = req.body.login;
        const senha = req.body.senha;

        if(!login || !senha){
            return res.status(400).send("login e senha obrigatorio");
        }

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
    }
    catch (err){
        console.error("Erro ao conectar", err);
        res.status.at(500).send("Erro interno")
    }
});

// Rota para lidar com o cadastro de objeto
app.post('/objeto', function(req, res){
    //Para os itens que vão serem cadastrados serem seguros e validos dentro de um vetor;
    [
        body('descricao').isString().trim().scape(),
        body('ambiente').isString().trim().scape(),
        body('professor').isString().trim().scape(),
        body('curso').isString().trim().scape(),
        body('data').isDate().trim().scape(),
        body('hora').isString().trim().scape(),
        body('encontrado').isBoolean()
    ],// inexperadamente precisa da virgula T_T; aqui é para validar o erro
    function(req, res){
        const errors =  validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array() });
        }
    }
    
    try{
        const descricao = req.body.objeto;
        const ambiente = req.body.ambiente;
        const professor = req.body.professor;
        const curso = req.body.curso;
        const data = req.body.data;
        const hora = req.body.hora;
        const encontrado = req.body.encontrado;
        connection.query('INSERT INTO objeto (descricao, ambiente, professor, curso, data, hora, encontrado) VALUES (?, ?, ?, ?, ?, ?, ?)', [descricao, ambiente, professor, curso, data, hora, encontrado], function(error, results, fields){
            if(error){
                console.error('Erro ao cadastrar objeto: ', error);
                res.status(500).send('Erro interno ao cadastrar objeto',error);
                return;
            }
            res.send('Objeto inserido com sucesso!');
            res.end();
            });
    } catch (error){
        console.error("Erro ao cadastrar o o bjeto", error);
        res.status(404).send("Erro interno");
       }
});

app.get('/listar', function(req, res){
    try{
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
    }catch(err){
        console.error("Erro ao listar", err);
        res.status(404).send("Erro interno");
    }
 
});

app.get('/excluir/:id', function(req, res){

    const id = req.params.id;

    const excluir = "DELETE FROM objeto WHERE id = ?";
    try{
        connection.query(excluir, [id], function(err, result){
            if(!err){
                console.log("Objeto deletado!");
                res.redirect('/listar')
            } else {
                console.log("Erro ao deletar objeto", err)
                res.status(500).send("Erro ao deletar objeto");
            }
        })
    }
    
catch (err){
    console.error("erro ao excluir o item", err);
    res.status(500).send("Erro interno ao tentar excluir");
}
  
});

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

