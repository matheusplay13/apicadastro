const express = require('express');//servidor web
const fs = require('fs');//manipulacao de arquivos
const path = require('path');//manipulacao de caminhos


const app = express();
const port = 3000;

app.use(express.json());
/*
CLIENTES ENDPOINTS
*/

const clientesFile = path.join(__dirname, "clientes.json");

function lerClientes() {
    
if(!fs.existsSync(clientesFile)){
    return [];
}
const dados = fs.readFileSync(clientesFile, 'utf8');
try{
    return JSON.parse(dados) || [];
} catch (e) {
    return [];
}
}
function salvarClientes(clientes) {
    fs.writeFileSync(clientesFile, JSON.stringify(clientes, null, 2), 'utf8');
    
}

app.post('/clientes', (req, res) => {
   const {nome, email, cpf, data_nascimento,bairro, telefone} = req.body;
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
   res.status(201).json({message: 'Cliente cadastrado com sucesso', cliente: novoCliente});
});

app.get("/clientes", (req, res) => {
    const clientes = lerClientes();
    res.status(200).json(clientes);
})

app.get("/clientes/:id", (req, res) => {
    const clientes = lerClientes();
    const cliente = clientes.find(c => c.id == req.params.id);
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
    
    if(!fs.existsSync(produtosFile)){
        return [];
    }
    const dados = fs.readFileSync(produtosFile, 'utf8');
    try{
        return JSON.parse(dados) || [];
    } catch (e) {
        return [];
    }
}
function salvarProdutos(produtos) {
    fs.writeFileSync(produtosFile, JSON.stringify(produtos, null, 2), 'utf8');
    
}

app.post("/produtos", (req, res) => {
    const {id, nome, valor, descrição} = req.body;
    if (!id || !nome || !valor || !descrição) {
        return res.status(400).json({ error:"Todos os campos são obrigatórios"});

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
    res.status(201).json({message: 'Produto cadastrado com sucesso', produto: novoProduto});
    
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


