# TecSolutions – Sistema

O **TecSolutions** é um sistema web completo que une o site institucional da empresa a um sistema interno para gestão de propostas comerciais, cronograma de atendimentos e clientes. Ele foi desenvolvido para otimizar o fluxo comercial e operacional, garantindo organização e eficiência.

## Funcionalidades

- **Site Institucional** com páginas de Início, Sobre, Serviços e Contato
- **Acesso ao Sistema** com login seguro
- **Dashboard** com indicadores e ações rápidas
- **Gestão de Propostas**: criação, edição, status e histórico
- **Cronograma de Atendimentos**: visualização em lista ou calendário, filtros, importação/exportação e controle de status
- **Gestão de Clientes, Serviços e Produtos**
- **Relatórios** financeiros e de desempenho
- **Gerenciamento de Usuários** com permissões
- Integração com importação de planilhas Excel
- Layout moderno e responsivo

## Tecnologias Utilizadas

- **Frontend**: React + TailwindCSS
- **Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL
- **Deploy**: Render

## Perfis de Acesso

- **Administrador** – acesso total ao sistema, gerenciamento de usuários e configurações
- **Usuário Comum** – acesso restrito às funções atribuídas pelo administrador

## Estrutura do Projeto

- `/frontend` → Interface do sistema e site institucional
- `/backend` → API e regras de negócio
- `/docs` → Documentação técnica e de requisitos

## Como rodar o projeto localmente

1. **Clone o repositório**:

   ```bash
   git clone https://github.com/seu-usuario/tecsolutions.git
   cd tecsolutions
   ```

2. **Backend** (`/backend`)

   ```bash
   cd backend
   npm install
   # configure o arquivo .env com suas credenciais
   npm run dev
   ```

3. **Frontend** (`/frontend`)
   ```bash
   cd ../frontend
   npm install
   # configure o arquivo .env com VITE_API_URL=http://localhost:3000
   npm run dev
   ```

> Acesse: `http://localhost:5173` (frontend) e `http://localhost:3000` (backend)

<ol>
<li><a href="documentos/01-Documentação de Contexto.md"> Documentação de Contexto</a></li>
<li><a href="documentos/02-Especificação do Projeto.md"> Especificação do Projeto</a></li>
<li><a href="documentos/03-Projeto de Interface.md"> Projeto de Interface</a></li>
<li><a href="documentos/04-Testes de Software.md"> Testes de Software</a></li>
<li><a href="documentos/05-Implantação.md"> Implantação</a></li>
</ol>

## Contato

**Vagner de Oliveira Florencio**

<a href="https://www.linkedin.com/in/vagner-florencio-85679860/" target="_blank">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
</a>

<a href="https://www.instagram.com/v4gn32/" target="_blank">
  <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram">
</a>
