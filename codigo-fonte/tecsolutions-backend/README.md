# TecSolutions Backend

Backend da aplicação TecSolutions desenvolvido em Node.js com Express, Prisma e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas
- **Winston** - Sistema de logs
- **Express Validator** - Validação de dados
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - Logger HTTP
- **Express Rate Limit** - Rate limiting

## 📁 Estrutura do Projeto

```
tec-backend/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── middleware/
│   │   ├── auth.js           # Middleware de autenticação
│   │   └── errorHandler.js   # Tratamento de erros
│   ├── routes/
│   │   ├── auth.js           # Rotas de autenticação
│   │   ├── clients.js        # Rotas de clientes
│   │   ├── inventory.js      # Rotas de inventário
│   │   ├── products.js       # Rotas de produtos
│   │   ├── proposals.js      # Rotas de propostas
│   │   ├── serviceRecords.js # Rotas de registros de serviço
│   │   ├── services.js       # Rotas de serviços
│   │   └── users.js          # Rotas de usuários
│   ├── utils/
│   │   ├── database.js       # Utilitários do banco
│   │   ├── logger.js         # Sistema de logs
│   │   └── validation.js     # Validações personalizadas
│   └── app.js               # Configuração do Express
├── logs/                    # Arquivos de log
├── .env.example            # Exemplo de variáveis de ambiente
├── package.json            # Dependências e scripts
├── server.js              # Servidor principal
└── README.md              # Este arquivo
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- PostgreSQL (versão 12 ou superior)
- npm ou yarn

### Configuração Rápida (Recomendada)

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd tecsolutions-backend
```

2. **Configure o banco PostgreSQL**
   - Crie um banco de dados chamado `tecsolutions_db`
   - Anote as credenciais de acesso

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações de banco:
```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/tecsolutions_db?schema=public"
JWT_SECRET="sua-chave-jwt-super-secreta-aqui"
```

4. **Execute a configuração automática**
```bash
npm run setup
```

Este comando irá:
- Instalar todas as dependências
- Gerar o cliente Prisma
- Executar as migrações do banco
- Popular o banco com dados iniciais

### Configuração Manual (Alternativa)

Se preferir fazer passo a passo:

1. **Instale as dependências**
```bash
npm install
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/tecsolutions"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui
JWT_EXPIRES_IN=24h

# Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

4. **Configure o banco de dados**
```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar as migrações
npx prisma migrate dev

# (Opcional) Visualizar o banco de dados
npx prisma studio
```

5. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📊 Banco de Dados

### Modelos Principais

- **User** - Usuários do sistema (administradores e funcionários)
- **Client** - Clientes da empresa
- **ClientUser** - Usuários dos clientes
- **Service** - Serviços oferecidos
- **Product** - Produtos do catálogo
- **Proposal** - Propostas comerciais
- **ProposalItem** - Itens das propostas
- **InventoryItem** - Itens do inventário (hardware/software)
- **ServiceRecord** - Registros de atendimento

### Relacionamentos

- Um cliente pode ter múltiplos usuários
- Uma proposta pertence a um cliente e pode ter múltiplos itens
- Itens de proposta podem ser serviços ou produtos
- Registros de serviço são vinculados a clientes

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

- **Login**: `POST /api/auth/login`
- **Registro**: `POST /api/auth/register` (apenas admins)
- **Perfil**: `GET /api/auth/me`
- **Refresh Token**: `POST /api/auth/refresh`

### Níveis de Acesso

- **admin**: Acesso total ao sistema
- **user**: Acesso limitado às funcionalidades básicas

## 📡 API Endpoints

### Autenticação
```
POST   /api/auth/login          # Login
POST   /api/auth/register       # Registro (admin only)
GET    /api/auth/me             # Perfil do usuário
POST   /api/auth/refresh        # Renovar token
```

### Usuários
```
GET    /api/users/system        # Listar usuários do sistema (admin)
POST   /api/users/system        # Criar usuário do sistema (admin)
GET    /api/users/system/:id    # Obter usuário do sistema (admin)
PUT    /api/users/system/:id    # Atualizar usuário do sistema (admin)
PATCH  /api/users/system/:id/status # Ativar/desativar usuário (admin)

GET    /api/users/clients       # Listar usuários de clientes
POST   /api/users/clients       # Criar usuário de cliente
GET    /api/users/clients/:id   # Obter usuário de cliente
PUT    /api/users/clients/:id   # Atualizar usuário de cliente
PATCH  /api/users/clients/:id/status # Ativar/desativar usuário
DELETE /api/users/clients/:id   # Excluir usuário de cliente
```

### Clientes
```
GET    /api/clients             # Listar clientes
POST   /api/clients             # Criar cliente
GET    /api/clients/:id         # Obter cliente
PUT    /api/clients/:id         # Atualizar cliente
PATCH  /api/clients/:id/status  # Ativar/desativar cliente
DELETE /api/clients/:id         # Excluir cliente
```

### Serviços
```
GET    /api/services            # Listar serviços
POST   /api/services            # Criar serviço
GET    /api/services/:id        # Obter serviço
PUT    /api/services/:id        # Atualizar serviço
PATCH  /api/services/:id/status # Ativar/desativar serviço
DELETE /api/services/:id        # Excluir serviço
GET    /api/services/categories # Listar categorias
```

### Produtos
```
GET    /api/products            # Listar produtos
POST   /api/products            # Criar produto
GET    /api/products/:id        # Obter produto
PUT    /api/products/:id        # Atualizar produto
PATCH  /api/products/:id/status # Ativar/desativar produto
PATCH  /api/products/:id/stock  # Atualizar estoque
DELETE /api/products/:id        # Excluir produto
GET    /api/products/categories # Listar categorias
```

### Propostas
```
GET    /api/proposals           # Listar propostas
POST   /api/proposals           # Criar proposta
GET    /api/proposals/:id       # Obter proposta
PUT    /api/proposals/:id       # Atualizar proposta
PATCH  /api/proposals/:id/status # Atualizar status
DELETE /api/proposals/:id       # Excluir proposta
```

### Inventário
```
GET    /api/inventory           # Listar itens do inventário
POST   /api/inventory           # Criar item do inventário
GET    /api/inventory/:id       # Obter item do inventário
PUT    /api/inventory/:id       # Atualizar item do inventário
DELETE /api/inventory/:id       # Excluir item do inventário
```

### Registros de Serviço
```
GET    /api/service-records     # Listar registros
POST   /api/service-records     # Criar registro
GET    /api/service-records/:id # Obter registro
PUT    /api/service-records/:id # Atualizar registro
DELETE /api/service-records/:id # Excluir registro
GET    /api/service-records/stats # Estatísticas
```

## 🔒 Segurança

### Medidas Implementadas

- **Helmet**: Headers de segurança HTTP
- **CORS**: Controle de origem cruzada
- **Rate Limiting**: Limite de requisições por IP
- **JWT**: Tokens seguros para autenticação
- **bcrypt**: Hash seguro de senhas
- **Validação**: Validação rigorosa de entrada
- **Sanitização**: Limpeza de dados de entrada

### Boas Práticas

- Senhas são hasheadas com bcrypt (salt rounds: 12)
- Tokens JWT têm expiração configurável
- Validação de entrada em todas as rotas
- Logs de auditoria para ações importantes
- Tratamento adequado de erros

## 📝 Logs

O sistema possui logging estruturado com Winston:

### Tipos de Log

- **app.log**: Logs gerais da aplicação
- **error.log**: Apenas erros
- **access.log**: Logs de requisições HTTP
- **audit.log**: Logs de auditoria

### Níveis de Log

- **error**: Erros críticos
- **warn**: Avisos importantes
- **info**: Informações gerais
- **http**: Requisições HTTP
- **debug**: Informações de debug (apenas desenvolvimento)

## 🧪 Desenvolvimento

### Scripts Disponíveis

```bash
npm start          # Iniciar em produção
npm run dev        # Iniciar em desenvolvimento (nodemon)
npm run prisma:generate # Gerar cliente Prisma
npm run prisma:migrate  # Executar migrações
npm run prisma:studio   # Abrir Prisma Studio
npm run prisma:reset    # Reset do banco (cuidado!)
```

### Variáveis de Ambiente

Consulte o arquivo `.env.example` para todas as variáveis disponíveis.

### Estrutura de Resposta da API

#### Sucesso
```json
{
  "message": "Operação realizada com sucesso",
  "data": { ... },
  "pagination": { ... } // quando aplicável
}
```

#### Erro
```json
{
  "error": "Mensagem de erro",
  "details": [ ... ] // detalhes de validação quando aplicável
}
```

## 🚀 Deploy

### Preparação para Produção

1. **Configure as variáveis de ambiente de produção**
2. **Execute as migrações do banco**
3. **Configure o servidor web (nginx/apache)**
4. **Configure SSL/TLS**
5. **Configure monitoramento e logs**

### Exemplo de Configuração Nginx

```nginx
server {
    listen 80;
    server_name api.tecsolutions.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico, entre em contato:

- **Email**: suporte@tecsolutions.com
- **Telefone**: (11) 9999-9999
- **Website**: https://tecsolutions.com

---

**TecSolutions Backend** - Desenvolvido com ❤️ pela equipe TecSolutions