# 📘 TecSolutions

**TecSolutions** é um sistema web completo que integra o site institucional da empresa com módulos internos para gestão de propostas comerciais, cronograma de atendimentos, clientes, serviços, produtos, relatórios e usuários. Foi desenvolvido para otimizar processos comerciais e operacionais, centralizando informações e facilitando a tomada de decisões.

## 🚀 Funcionalidades principais

- Cadastro e login de usuários com autenticação segura
- Controle de permissões (administrador e usuários comuns)
- CRUD completo de propostas comerciais
- Módulo de cronograma de atendimentos com filtros e agendamento
- Gestão de clientes, serviços e produtos
- Relatórios financeiros e operacionais
- Exportação de dados em PDF e Excel
- Integração com banco de dados PostgreSQL
- API REST com backend Node.js
- Interface web moderna com React + Tailwind CSS

---

## 📁 Estrutura do Projeto

O código-fonte está organizado dentro da pasta `codigo-fonte`, dividida em dois principais diretórios:

---

## 🔧 `ts-backend`

Backend responsável pelas regras de negócio e persistência de dados.

**Principais tecnologias:**

- Node.js
- Express
- PostgreSQL
- JWT (JSON Web Token)
- Dotenv
- Nodemailer

**Funcionalidades:**

- Rotas RESTful
- Validações de entrada
- Autenticação e autorização
- Conexão com o banco PostgreSQL
- Envio de e-mails para notificações internas

---

## 💻 `ts-frontend`

Frontend responsável pela interface com o usuário.

**Principais tecnologias:**

- React
- Tailwind CSS
- Context API (para autenticação)
- Axios

**Funcionalidades:**

- Login e logout de usuários
- Cadastro e gerenciamento de propostas
- Registro e visualização de cronogramas
- Cadastro e listagem de clientes, serviços e produtos
- Relatórios com exportação para PDF e Excel
- Exibição de páginas protegidas com base no tipo de usuário

---

## 📂 Acesse o código

Para navegar pelo código, clique na pasta [`codigo-fonte`](./codigo-fonte), onde você poderá explorar separadamente:

- [`ts-backend`](./codigo-fonte/ts-backend)
- [`ts-frontend`](./codigo-fonte/ts-frontend)

---

## 🧠 Requisitos implementados

- [x] RF-001 - Cadastro de usuário
- [x] RF-002 - Login
- [x] RF-003 - Cadastro de proposta
- [x] RF-004 - Módulo de cronograma
- [x] RF-005 - Cadastro de clientes, serviços e produtos
- [x] RF-006 - Relatórios
- [x] RF-007 - Exportação de dados
- [x] RF-008 - Controle de permissões
- [x] RNF-001 - Interface amigável e responsiva

---

## 📌 Pré-requisitos

- Node.js (v18+)
- PostgreSQL
- Git

---

## ⚙️ Como rodar o projeto

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/TecSolutions.git

# Acesse a pasta do backend
cd TecSolutions/codigo-fonte/ts-backend

# Instale as dependências do backend
npm install

# Configure o .env e execute o backend
npm run dev

# Em outro terminal, acesse o frontend
cd ../ts-frontend

# Instale as dependências do frontend
npm install

# Execute o frontend
npm run dev
```
