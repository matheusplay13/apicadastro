const express = require('express');//servidor web
const fs = require('fs');//manipulacao de arquivos
const path = require('path');//manipulacao de caminhos
const cors = require('cors');//habilitar cors
const jwt = require('jsonwebtoken');//gerar tokens de autenticação


const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const SECRET_KEY = 'sua_chave_secreta_aqui';

/*
USUÁRIOS ENDPOINTS
*/

const usuariosFile = path.join(__dirname, "usuarios.json");

function lerUsuarios() {
    if (!fs.existsSync(usuariosFile)) {
        return [];
    }
    const dados = fs.readFileSync(usuariosFile, 'utf8');
    try {
        const parsed = JSON.parse(dados);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function salvarUsuarios(usuarios) {
    fs.writeFileSync(usuariosFile, JSON.stringify(usuarios, null, 2), 'utf8');
}

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const usuarios = lerUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const token = jwt.sign(
        { id: usuario.id, email: usuario.email, nome: usuario.nome },
        SECRET_KEY,
        { expiresIn: '24h' }
    );

    res.status(200).json({
        message: 'Login realizado com sucesso',
        token,
        user: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }
    });
});

app.post('/usuarios', (req, res) => {
    const { codigo, nome, email, senha, confirmarSenha } = req.body;

    if (!codigo || !nome || !email || !senha) {
        return res.status(400).json({ error: 'Campos código, nome, email e senha são obrigatórios' });
    }

    if (confirmarSenha && senha !== confirmarSenha) {
        return res.status(400).json({ error: 'As senhas não coincidem' });
    }

    if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }

    const usuarios = lerUsuarios();

    if (usuarios.some(u => u.email === email)) {
        return res.status(400).json({ error: 'Email já cadastrado' });
    }

    if (usuarios.some(u => u.codigo === codigo)) {
        return res.status(400).json({ error: 'Código já cadastrado' });
    }

    const novoUsuario = {
        codigo,
        nome,
        email,
        senha,
        data_cadastro: new Date().toISOString()
    };

    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    res.status(201).json({
        message: 'Usuário cadastrado com sucesso',
        usuario: novoUsuario
    });
});

app.get('/usuarios', (req, res) => {
    const usuarios = lerUsuarios();
    res.status(200).json(usuarios);
});

app.get('/usuarios/:codigo', (req, res) => {
    const usuarios = lerUsuarios();
    const usuario = usuarios.find(u => u.codigo === req.params.codigo);
    if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.status(200).json(usuario);
});

function verificarToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}
/*
CLIENTES ENDPOINTS
*/

const clientesFile = path.join(__dirname, "clientes.json");

function lerClientes() {

    if (!fs.existsSync(clientesFile)) {
        return [];
    }
    const dados = fs.readFileSync(clientesFile, 'utf8');
    try {
        return JSON.parse(dados) || [];
    } catch (e) {
        return [];
    }
}
function salvarClientes(clientes) {
    fs.writeFileSync(clientesFile, JSON.stringify(clientes, null, 2), 'utf8');

}

app.post('/clientes', (req, res) => {
    const { nome, email, cpf, data_nascimento, bairro, telefone } = req.body;
    if (!nome || !email || !cpf || !data_nascimento || !bairro || !telefone) {
        return res.status(400).json({ error: 'Caira uma bomba na tua casa' });
    }
    const clientes = lerClientes();
    if (clientes.some(c => c.cpf === cpf)) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
    }
    const novoCliente = {
        nome,
        email,
        cpf,
        data_nascimento,
        bairro,
        telefone
    };
    clientes.push(novoCliente);
    salvarClientes(clientes);
    res.status(201).json({ message: 'Cliente cadastrado com sucesso', cliente: novoCliente });
});

app.get("/clientes", (req, res) => {
    const clientes = lerClientes();
    res.status(200).json(clientes);
})

app.get("/clientes/:cpf", (req, res) => {
    const clientes = lerClientes();
    const cliente = clientes.find(c => c.cpf == req.params.cpf);
    if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.status(200).json(cliente);
})



app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});


const produtosFile = path.join(__dirname, "produtos.json");

function lerProdutos() {

    if (!fs.existsSync(produtosFile)) {
        return [];
    }
    const dados = fs.readFileSync(produtosFile, 'utf8');
    try {
        return JSON.parse(dados) || [];
    } catch (e) {
        return [];
    }
}
function salvarProdutos(produtos) {
    fs.writeFileSync(produtosFile, JSON.stringify(produtos, null, 2), 'utf8');

}

app.post("/produtos", (req, res) => {
    const { id, nome, valor, descrição } = req.body;
    if (!id || !nome || !valor || !descrição) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });

    }
    const produtos = lerProdutos();
    if (produtos.some(p => p.id === id)) {
        return res.status(400).json({ error: 'ID já cadastrado' });
    }
    const novoProduto = {
        id,
        nome,
        valor,
        descrição
    };
    produtos.push(novoProduto);
    salvarProdutos(produtos);
    res.status(201).json({ message: 'Produto cadastrado com sucesso', produto: novoProduto });

});

app.get("/produtos", (req, res) => {
    const produtos = lerProdutos();
    res.status(200).json(produtos);
});

app.get("/produtos/:id", (req, res) => {
    const produtos = lerProdutos();
    const produto = produtos.find(p => p.id == req.params.id);
    if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.status(200).json(produto);
});


const usuarioFile = path.join(__dirname, "usuarios.json");

function lerUsuarios() {
    if (!fs.existsSync(usuarioFile)) {
        return [];
    }
    const dadosUsuarios = fs.readFileSync(usuarioFile, 'utf8');
    try {
        return JSON.parse(dadosUsuarios) || [];
    } catch (e) {
        return [];
    }

}
function salvarUsuarios(usuarios) {
    fs.writeFileSync(usuarioFile, JSON.stringify(usuarios, null, 2), 'utf8');

}

app.post("/usuarios", (req, res) => {
    const { codigo, nome, email, senha } = req.body;
    if (!codigo || !nome || !email || !senha) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }
    const usuarios = lerUsuarios();
    if (usuarios.some(u => u.email === email || u.codigo === codigo)) {
        return res.status(400).json({ error: 'Email ou código já cadastrado' });
    }
    const novoUsuario = {
        codigo,
        nome,
        email,
        senha
    };
    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);
    res.status(201).json({ message: 'Usuario cadastrado com sucesso', usuario: novoUsuario });

});
app.get("/usuarios", (req, res) => {
    const usuarios = lerUsuarios();
    res.status(200).json(usuarios);
});

app.get("/usuarios/:codigo", (req, res) => {
    const usuarios = lerUsuarios();
    const usuario = usuarios.find(u => u.codigo == req.params.codigo);
    if (!usuario) {
        return res.status(404).json({ error: 'Usuario não encontrado' });
    }
    res.status(200).json(usuario);
});

app.post('/login', (req, res) => {
    const { email, senha} =req.body;
    const usuarios =lerUsuarios();

    const usuario = usuarios.find(u=>u.email === email && u.senha === senha);

    if (!usuario) {
        return res.status(401).json({ error: 'Email ou senha incorretos'});

    }
    res.status(200).json({message: 'Login realizado com sucesso', usuario });
});
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});