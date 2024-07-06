// Declaração das constantes para dependências
const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const { format } = require('date-fns');
const path = require('path');
const multer = require('multer');
const fs = require('fs');


// Inicialização do express
const app = express();

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

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
 
try {
    connection.connect(function(err) {
        if (err) {
            console.error('Erro ao conectar:', err);
        } else {  
            console.log('Conexão com sucesso');
        }
    });
} catch (err) {
    console.error('Erro ao conectar (fora do callback):', err);
}
 
// Rota index
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
 
// Rota de apoio
app.get('/apoio', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/html', 'apoio.html'));
});
 
// Rota de apoio
app.get('/carrossel', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/html', 'carrossel.html'));
});

// Rota sobre
app.get('/sobre', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/html', 'sobre.html'));
});
 
// Rota para cadastrar item
app.get('/cadastrarItem', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/html', 'cadastrarItem.html'));
});
 
// Rota para página inicial
app.get('/home', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/html', 'home.html'));
});
 
// Rota para login
app.post('/login', function(req, res) {
    try {
        const { login, senha } = req.body;
 
        if (!login || !senha) {
            return res.status(400).send("Login e senha são obrigatórios");
        }
 
        connection.query('SELECT * FROM login WHERE login=? and senha=?', [login, senha], function(error, results, fields) {
            if (error) {
                console.error('Erro ao executar a consulta ', error);
                res.status(500).send('Erro interno ao verificar credenciais');
                return;
            }
            if (results.length > 0) {
                res.redirect('/home');
            } else {
                res.status(401).send('Credenciais inválidas');
            }
        });
    } catch (err) {
        console.error("Erro ao conectar", err);
        res.status(500).send("Erro interno");
    }
});
 
// Rota para cadastrar objeto
app.post('/objeto', upload.single('imagem_objeto'), [
    body('descricao').isString().trim().escape(),
    body('ambiente').isString().trim().escape(),
    body('professor').isString().trim().escape(),
    body('curso').isString().trim().escape(),
    body('data').isDate().trim().escape(),
    body('hora').isString().trim().escape(),
    body('encontrado').isBoolean(),
    body('imagem_objeto').isString().trim().escape()
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
 
    try {
        const { descricao, ambiente, professor, curso, data, hora, encontrado } = req.body;
        const imagem_objeto = req.file ? req.file.filename : null;
 
        connection.query('INSERT INTO objeto (descricao, ambiente, professor, curso, data, hora, encontrado, imagem_objeto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [descricao, ambiente, professor, curso, data, hora, encontrado, imagem_objeto], function(error, results, fields) {
            if (error) {
                console.error('Erro ao cadastrar objeto: ', error);
                res.status(500).send('Erro interno ao cadastrar objeto');
                return;
            }
            res.send('Objeto inserido com sucesso!');
        });
    } catch (error) {
        console.error("Erro ao cadastrar o objeto", error);
        res.status(404).send("Erro interno");
    }
});
 
// Rota para listar objetos
app.post('/listar', function(req, res) {
    try {
        const listar = "SELECT * FROM objeto";
 
        connection.query(listar, function(err, rows) {
            if (!err) {
                console.log("Consulta realizada com sucesso!");
                res.render('listar', { objetos: rows, format });
            } else {
                console.log("Erro no relatório de Itens", err);
                res.status(500).send("Erro no relatório de Itens");
            }
        });
    } catch (err) {
        console.error("Erro ao listar", err);
        res.status(404).send("Erro interno");
    }
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
app.get('/excluir/:id', function(req, res) {
    const id = req.params.id;
    const excluir = "DELETE FROM objeto WHERE id = ?";
    try {
        connection.query(excluir, [id], function(err, result) {
            if (!err) {
                console.log("Objeto deletado!");
                res.redirect('/listar');
            } else {
                console.log("Erro ao deletar objeto", err);
                res.status(500).send("Erro ao deletar objeto");
            }
        });
    } catch (err) {
        console.error("Erro ao excluir o item", err);
        res.status(500).send("Erro interno ao tentar excluir");
    }
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
