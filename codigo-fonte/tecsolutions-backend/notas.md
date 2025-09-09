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
``
 /* prisma/schema.prisma
✅ Prisma Schema do TecSolutions (PostgreSQL)
- Inclui: Users, Clients, Services, Products, Proposals/Items
- Inventário: HardwareAsset, SoftwareLicense
- Atendimentos: Ticket (+ Materials usados)
- Comentários explicando cada parte
*/

// 🔧 Gerador do Client Prisma (usado no código Node/Express)
generator client {
  provider = "prisma-client-js"
}

// 🗄️ Conexão com PostgreSQL via variável de ambiente
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 📚 Enums (tipos de valores fixos)
enum UserRole {
  ADMIN
  TECH
}

enum ClientType {
  CONTRACT   // Cliente com contrato
  ONE_OFF    // Cliente avulso
}

enum ProposalStatus {
  DRAFT
  SENT
  APPROVED
  REJECTED
  CANCELED
}

enum ProductCategory {
  SERVICE_BUNDLE
  HARDWARE
  SOFTWARE
  OTHER
}

enum AssetStatus {
  ACTIVE
  IN_REPAIR
  OUT_OF_SERVICE
  DISMISSED    // Desativado/Descartado/Doação
}

enum SoftwareStatus {
  ACTIVE
  EXPIRED
  SUSPENDED
}

enum TicketType {
  REMOTE
  ONSITE
  LAB
  THIRDPARTY
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  PENDING_CLIENT
  RESOLVED
  CLOSED
  CANCELED
}

// 👤 Usuário
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // hash da senha
  role      UserRole @default(TECH)

  // Relacionamentos
  createdTickets  Ticket[] @relation("TicketCreatedBy")    // tickets abertos por este usuário
  assignedTickets Ticket[] @relation("TicketAssignedTo")   // tickets atribuídos a este usuário
  proposalsSent   Proposal[] @relation("ProposalCreatedBy")

  // Auditoria
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 🧩 Cliente
model Client {
  id          String      @id @default(cuid())
  name        String
  document    String?     // CNPJ/CPF
  type        ClientType  @default(CONTRACT)
  email       String?
  phone       String?
  address     String?
  notes       String?

  // Relacionamentos
  hardwareAssets   HardwareAsset[]
  softwareLicenses SoftwareLicense[]
  tickets          Ticket[]
  proposals        Proposal[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name])
  @@index([document])
}

// 🛎️ Serviços (catálogo de serviços vendidos/prestados)
model Service {
  id          String  @id @default(cuid())
  name        String
  description String?
  unitPrice   Decimal @db.Decimal(12,2) // preço unitário
  isActive    Boolean @default(true)

  // Relacionamentos (pode ser referenciado em itens de proposta)
  proposalItems ProposalItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name])
}

// 📦 Produtos (hardware/software vendidos como item)
model Product {
  id          String          @id @default(cuid())
  name        String
  description String?
  category    ProductCategory @default(OTHER)
  unitPrice   Decimal         @db.Decimal(12,2)
  sku         String?         @unique
  isActive    Boolean         @default(true)

   // Relação com TicketMaterial
  ticketMaterials TicketMaterial[]

  proposalItems ProposalItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name, category])
}

// 🧾 Propostas comerciais
model Proposal {
  id            String          @id @default(cuid())
  clientId      String
  createdById   String          // usuário que criou/enviou
  number        Int             // número sequencial (por ano, opcional)
  title         String
  status        ProposalStatus  @default(DRAFT)
  issueDate     DateTime        @default(now())
  validUntil    DateTime?
  notes         String?

  // Totais (denormalizados para performance; recalculados pelo backend)
  subtotal      Decimal         @db.Decimal(12,2) @default(0)
  discount      Decimal         @db.Decimal(12,2) @default(0)
  taxes         Decimal         @db.Decimal(12,2) @default(0)
  total         Decimal         @db.Decimal(12,2) @default(0)

  client        Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  createdBy     User     @relation("ProposalCreatedBy", fields: [createdById], references: [id])
  items         ProposalItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clientId])
  @@index([status])
  @@unique([number])
}

// 🧾 Itens da proposta
// - Pode referenciar um Service OU um Product (um dos dois)
model ProposalItem {
  id          String   @id @default(cuid())
  proposalId  String

  // Referência opcional a Service OU Product
  serviceId   String?
  productId   String?

  description String? // descrição livre exibida no PDF
  quantity    Int     @default(1)
  unitPrice   Decimal @db.Decimal(12,2)
  lineTotal   Decimal @db.Decimal(12,2) // calculado = quantity * unitPrice, salvo para histórico

  proposal Proposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)
  service  Service? @relation(fields: [serviceId], references: [id])
  product  Product? @relation(fields: [productId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([proposalId])
  @@index([serviceId])
  @@index([productId])
}

// 🖥️ Inventário de Hardware
model HardwareAsset {
  id            String      @id @default(cuid())
  clientId      String
  type          String      // Ex: "Desktop", "Laptop", "Switch", "Router", "Printer"
  brand         String?     // Marca
  model         String?     // Modelo
  serialNumber  String?     @unique
  hostname      String?     // Nome do equipamento
  location      String?     // Ex: "Escritório - Sala 2 - Rack"
  status        AssetStatus @default(ACTIVE)
  purchaseDate  DateTime?
  warrantyUntil DateTime?
  notes         String?

  // Atributos técnicos comuns
  cpu          String?
  ramGb        Int?
  storageType  String?      // HDD/SSD/NVMe
  storageGb    Int?
  os           String?      // Ex: "Windows 11 Pro"
  ipAddress    String?
  macAddress   String?

  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clientId])
  @@index([type, status])
}

// 🧑‍💻 Inventário de Software / Licenças
model SoftwareLicense {
  id               String         @id @default(cuid())
  clientId         String
  name             String         // Ex: "Microsoft 365 Business Standard"
  version          String?        // Ex: "v2024"
  licenseKey       String?        @unique
  seats            Int?           // Quantidade de licenças
  assignedSeats    Int?           // Quantidade atribuída (opcional)
  vendor           String?        // Ex: "Microsoft"
  status           SoftwareStatus @default(ACTIVE)
  purchaseDate     DateTime?
  startDate        DateTime?
  expirationDate   DateTime?
  renewalCycleDays Int?           // Ex: 365 (para anual)
  notes            String?

  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clientId])
  @@index([name, status])
}

// 🎫 Atendimentos (Tickets)
model Ticket {
  id            String       @id @default(cuid())
  clientId      String
  createdById   String       // quem abriu
  assignedToId  String?      // técnico responsável
  type          TicketType   // REMOTE / ONSITE / LAB / THIRDPARTY
  title         String
  description   String?
  status        TicketStatus @default(OPEN)

  // Janela do atendimento
  openedAt      DateTime     @default(now())
  startedAt     DateTime?
  finishedAt    DateTime?

  // Métrica resumida
  timeSpentHrs  Decimal?     @db.Decimal(12,2) // ex.: 1.50 = 1h30

  // Itens/materiais usados no atendimento (opcional)
  materialsUsed TicketMaterial[]

  // Ligações
  client      Client @relation(fields: [clientId], references: [id], onDelete: Restrict)
  createdBy   User   @relation("TicketCreatedBy", fields: [createdById], references: [id])
  assignedTo  User?  @relation("TicketAssignedTo", fields: [assignedToId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clientId])
  @@index([status, type])
  @@index([assignedToId])
}

// 🧰 Materiais/Produtos usados em um Ticket
// - Ajuda a compor relatórios e custos (opcional)
model TicketMaterial {
  id         String   @id @default(cuid())
  ticketId   String
  name       String          // Nome do material (livre) OU referência ao Product
  productId  String?         // Se quiser atrelar a um Product do catálogo
  quantity   Int      @default(1)
  unitCost   Decimal? @db.Decimal(12,2)
  notes      String?

  ticket  Ticket  @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  product Product? @relation(fields: [productId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ticketId])
  @@index([productId])
} `` 

# gera client
npx prisma generate

# criar primeira migration e aplicar (irá criar as tabelas)
npx prisma migrate dev --name init

# prisma/seed.js
// Execute: node prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  // Usuário Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tecsolutions.local' },
    update: {},
    create: {
      name: 'Admin Tec',
      email: 'admin@tecsolutions.local',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  // Cliente exemplo
  const client = await prisma.client.upsert({
    where: { email: 'cliente@empresa.com' },
    update: {},
    create: {
      name: 'Empresa Exemplo',
      cnpj: '12.345.678/0001-99',
      email: 'cliente@empresa.com',
      phone: '11999999999',
      address: 'Rua Exemplo, 123',
    },
  });

  // Serviço exemplo
  const service = await prisma.service.create({
    data: {
      title: 'Suporte Mensal',
      description: 'Pacote de suporte remoto e presencial',
      price: 1500,
      clientId: client.id,
    },
  });

  // Produto exemplo
  const product = await prisma.product.create({
    data: {
      name: 'Servidor Dell R740',
      category: 'Hardware',
      price: 15000,
      stock: 2,
      clientId: client.id,
    },
  });

  console.log({ admin, client, service, product });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
