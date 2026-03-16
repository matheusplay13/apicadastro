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



app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
