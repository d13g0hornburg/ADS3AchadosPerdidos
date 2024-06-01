//declaração das constantes para dependencias
const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//Arquivos estáticos dentro da pasta public

app.use(express.static('public'));

//armazena os dados da conexao
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root99',
    database: 'apApp'
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

//configuracao da aplicacao rodando no localhost, ouvindo a porta 8008
app.listen(8008, function(){
    console.log('Servidor rodando na url http://localhost:8008');
});

