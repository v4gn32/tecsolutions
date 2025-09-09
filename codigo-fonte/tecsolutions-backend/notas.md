# criar pasta e entrar
mkdir tecsolutions-backend
cd tecsolutions-backend

# inicializar npm
npm init -y

# instalar dependências
npm install express cors dotenv bcryptjs jsonwebtoken prisma @prisma/client

# dependências de desenvolvimento
npm install -D nodemon

# inicializar prisma
npx prisma init

# .env
DATABASE_URL="postgresql://vagneradmin:Mudar2025@localhost:5432/db_tecsolutions?schema=public"
PORT=3000
JWT_SECRET="f79a74921a7c933ede6ab7e8efe297aea7969b80f956160029307ae2e52baee1"

# Modelo Banco de Dados
` 

# gera client
npx prisma generate

# criar primeira migration e aplicar (irá criar as tabelas)
npx prisma migrate dev --name init

# prisma/seed.js

