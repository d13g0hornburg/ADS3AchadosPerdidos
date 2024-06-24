// Declaração das constantes para dependências
const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { format } = require('date-fns');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crie a pasta uploads se ela não existir
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Configuração do express
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexão com o banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root99',
    database: 'apapp'
});

connection.connect(function (err) {
    if (err) {
        console.error("Erro de conexão!", err);
        return;
    }
    console.log("Conexão estabelecida!");
});

// Rota index
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Outras rotas
app.get('/apoio', function (req, res) {
    res.sendFile(__dirname + '/apoio.html');
});

app.get('/sobre', function (req, res) {
    res.sendFile(__dirname + '/sobre.html');
});

app.get('/cadastrarItem', function (req, res) {
    res.sendFile(__dirname + '/cadastrarItem.html');
});

app.get('/home', function (req, res) {
    res.sendFile(__dirname + '/home.html');
});

// Rota para login
app.post('/login', function (req, res) {
    const login = req.body.login;
    const senha = req.body.senha;

    connection.query('SELECT * FROM login WHERE login=? and senha=?', [login, senha], function (error, results, fields) {
        if (error) {
            console.error('Erro ao executar a consulta ', error);
            res.status(500).send('Erro interno ao verificar credenciais');
            return;
        }
        if (results.length > 0) {
            res.redirect('html/home.html');
        } else {
            res.status(401).send('Credenciais inválidas');
        }
    });
});

// Rota para cadastrar objeto
app.post('/objeto', upload.single('imagem_objeto'), function (req, res) {
    const { descricao, ambiente, professor, curso, data, hora, encontrado } = req.body;
    const imagem_objeto = req.file.filename;

    if (!imagem_objeto) {
        res.status(400).send('Erro: Nenhum arquivo de imagem enviado.');
        return;
    }

    // Query para inserir os dados do objeto no banco de dados
    const query = 'INSERT INTO objeto (descricao, ambiente, professor, curso, data, hora, encontrado, imagem_objeto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [descricao, ambiente, professor, curso, data, hora, encontrado, imagem_objeto], function (error, results, fields) {
        if (error) {
            console.error('Erro ao cadastrar objeto: ', error);
            res.status(500).send('Erro interno ao cadastrar objeto');
            return;
        }
        res.send('Objeto inserido com sucesso!');
    });
});

// Rota para listar objetos
app.get('/listar', function (req, res) {
    const listar = "SELECT * FROM objeto";
    connection.query(listar, function (err, rows) {
        if (!err) {
            res.render('listar', { objetos: rows, format });
        } else {
            console.error("Erro no relatório de itens", err);
            res.status(500).send("Erro no relatório de itens");
        }
    });
});

// Rota para exibir o formulário de edição
app.get('/editar/:id', function (req, res) {
    const id = req.params.id;
    const query = 'SELECT * FROM objeto WHERE id = ?';
    connection.query(query, [id], function (err, results) {
        if (!err) {
            if (results.length > 0) {
                const objeto = results[0];
                res.render('editarItem', { objeto, format });
            } else {
                res.status(404).send('Objeto não encontrado');
            }
        } else {
            console.error('Erro ao buscar objeto para edição: ', err);
            res.status(500).send('Erro interno ao buscar objeto para edição');
        }
    });
});

// Rota para atualizar o objeto
app.post('/atualizarObjeto/:id', upload.single('imagem_objeto'), function (req, res) {
    const id = req.params.id;
    const { descricao, ambiente, professor, curso, data, hora, encontrado } = req.body;
    const imagem_objeto = req.file ? req.file.filename : req.body.imagem_existente;
    const query = 'UPDATE objeto SET descricao = ?, ambiente = ?, professor = ?, curso = ?, data = ?, hora = ?, encontrado = ?, imagem_objeto = ? WHERE id = ?';

    connection.query(query, [descricao, ambiente, professor, curso, data, hora, encontrado, imagem_objeto, id], function (err, results) {
        if (!err) {
            res.redirect('/listar');
        } else {
            console.error('Erro ao atualizar objeto: ', err);
            res.status(500).send('Erro interno ao atualizar objeto');
        }
    });
});

// Rota para excluir objeto
app.get('/excluir/:id', function (req, res) {
    const id = req.params.id;
    const excluir = "DELETE FROM objeto WHERE id = ?";
    connection.query(excluir, [id], function (err, result) {
        if (!err) {
            console.log("Objeto deletado!");
            res.redirect('/listar');
        } else {
            console.error("Erro ao deletar objeto", err);
            res.status(500).send("Erro ao deletar objeto");
        }
    });
});

// Rota para imprimir objeto
app.get('/imprimir/:id', function (req, res) {
    const id = req.params.id;
    const query = 'SELECT * FROM objeto WHERE id = ?';
    connection.query(query, [id], function (err, results) {
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

// Configuração da aplicação rodando no localhost, ouvindo a porta 8008
app.listen(8008, function () {
    console.log('Servidor rodando na url http://localhost:8008');
});
