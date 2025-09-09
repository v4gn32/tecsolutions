# 📄 Especificação do Projeto — TecSolutions

## ✅ Definição do Problema

Empresas prestadoras de serviços enfrentam dificuldades em gerenciar propostas comerciais, cronogramas de atendimento, clientes, serviços e produtos de forma centralizada e eficiente. O uso de planilhas e controles manuais é pouco escalável, propenso a erros e dificulta a comunicação entre equipes.

## 💡 Proposta de Solução

Desenvolver uma plataforma online chamada **TecSolutions**, que permita o gerenciamento unificado de propostas, cronogramas, clientes, serviços, produtos e relatórios. O sistema visa otimizar a operação comercial e técnica, melhorar a comunicação interna e oferecer indicadores para a tomada de decisão.

---

## 👥 Usuários

| Tipo de Usuário   | Descrição                                                   | Responsabilidades                                                                 |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Administrador** | Responsável pela gestão geral da plataforma.                | Criar e editar propostas, gerenciar usuários, configurar cronogramas e relatórios.|
| **Usuário Comum** | Funcionário com permissões limitadas.                        | Acessar propostas atribuídas, registrar atendimentos, consultar cronogramas.     |

---

## 🛠️ Arquitetura e Tecnologias

- **Frontend:** Vite + React + TypeScript + TailwindCSS 
- **Backend:** Node.js + Express(MVC) + Prisma ORM
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT com roles (admin e usuário)
- **Hospedagem:** Render (backend, frontend)
- **Integrações Futuras:** API para importação/exportação de dados (Excel, PDF)

> Um diagrama de arquitetura será criado para representar a interação entre os módulos da plataforma.

![Diagrama Arquitetura](https://raw.githubusercontent.com/v4gn32/tecsolutions/main/documentos/img/Diagrama-Arquitetura.png)


---

# 💰 Estrutura de Custos — Projeto TecSolutions

## 📦 Custo do Projeto (Entrega única)

| Item                          | Descrição                                        | Valor Estimado    |
| ----------------------------- | ------------------------------------------------ | ----------------- |
| **Desenvolvimento**           | Desenvolvimento completo do sistema              | R$ 10.000,00      |
| **Hospedagem (6 meses)**      | Custo baseado em serviços de nuvem               | R$ 200,00         |
| **Registro de Domínio**       | Registro .com.br anual                           | R$ 40,00          |
| **Infraestrutura e Suporte**  | Configuração de nuvem, backup e automações       | R$ 1.000,00       |
| **Email Profissional**        | Google Workspace por 6 meses (opcional incluído) | R$ 180,00         |
| **🔸 Subtotal**               |                                                  | R$ 11.420,00      |
| **💸 Desconto Aplicado**      | Desconto comercial para fechamento               | **- R$ 1.420,00** |
| **💰 Valor Final do Projeto** | **Total com desconto incluso**                   | **R$ 10.000,00**  |

---

## 🔄 Mensalidade Pós-Entrega (manutenção + suporte)

| Descrição                                  | Valor Original | Desconto Aplicado | Valor com Desconto |
| ------------------------------------------ | -------------- | ----------------- | ------------------ |
| Manutenção, atualizações e suporte técnico | R$ 590,00      | R$ 100,00         | **R$ 490,00/mês**  |

---

**📌 Observação:**  
Os valores cobrem todo o desenvolvimento, setup de infraestrutura, deploy, domínio, armazenamento e configurações iniciais.  
A mensalidade cobre atualizações, monitoramento, suporte técnico e pequenas melhorias contínuas no sistema.

---

## 🧩 Funcionalidades Principais

### Requisitos Funcionais

| ID     | Descrição                                                               |
| ------ | ----------------------------------------------------------------------- |
| RF-001 | Cadastro e login de usuários com autenticação JWT.                      |
| RF-002 | Cadastro de usuários pelo administrador (com função `admin`).           |
| RF-003 | Cadastro e edição de propostas comerciais com cálculo automático.       |
| RF-004 | Registro e acompanhamento de cronogramas de atendimento.                |
| RF-005 | Cadastro e controle de clientes, serviços e produtos.                   |
| RF-006 | Relatórios detalhados por período e tipo de serviço.                    |
| RF-007 | Exportação de dados em PDF ou Excel.                                     |
| RF-008 | Notificações internas sobre alterações no cronograma ou propostas.      |
| RF-009 | Dashboard com indicadores em tempo real.                                |
| RF-010 | Logout e controle de sessão.                                            |

### Requisitos Não Funcionais

| ID      | Descrição                                                    |
| ------- | ------------------------------------------------------------ |
| RNF-001 | Sistema responsivo para dispositivos móveis.                 |
| RNF-002 | Tempo de resposta inferior a 3 segundos por requisição.      |
| RNF-003 | Dados sensíveis criptografados no banco (senhas, tokens).    |
| RNF-004 | Conformidade com a LGPD no armazenamento e acesso aos dados. |
| RNF-005 | Compatível com navegadores modernos: Chrome, Firefox e Edge. |

### Restrições do Projeto

| ID      | Descrição                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------ |
| RST-001 | O projeto deverá ser desenvolvido e entregue no prazo máximo de 90 dias.                         |
| RST-002 | O sistema deverá utilizar obrigatoriamente as tecnologias: React, Node.js e PostgreSQL.          |
| RST-003 | O domínio e a infraestrutura devem ser previamente definidos pelo cliente.                       |
| RST-004 | A solução deverá operar apenas em ambiente web (não há versão mobile nativa prevista).           |
| RST-005 | O upload de arquivos será restrito aos formatos PDF e XLSX.                                      |
| RST-006 | O plano gratuito do serviço de hospedagem será usado durante a fase inicial.                     |
| RST-007 | Qualquer alteração no escopo após o aceite da proposta implicará novo orçamento.                 |

---

## 🎯 Casos de Uso — Sistema TecSolutions

| ID     | Nome do Caso de Uso               | Ator                    | Descrição                                                             | Pré-condições               | Pós-condições                           |
| ------ | --------------------------------- | ----------------------- | --------------------------------------------------------------------- | --------------------------- | --------------------------------------- |
| UC-001 | Autenticar no Sistema             | Usuário / Administrador | Realiza login com e-mail e senha.                                     | -                           | Usuário autenticado ou erro exibido.    |
| UC-002 | Gerenciar Propostas               | Administrador           | Criar, editar, excluir e visualizar propostas comerciais.             | Administrador autenticado   | Propostas registradas na base de dados. |
| UC-003 | Gerenciar Cronograma              | Administrador / Usuário | Registrar e atualizar cronogramas de atendimento.                     | Usuário autenticado         | Cronograma atualizado.                  |
| UC-004 | Visualizar Relatórios             | Administrador           | Exibe relatórios com base nos dados do sistema.                        | Dados disponíveis           | Relatório visualizado.                  |
| UC-005 | Gerenciar Clientes e Serviços     | Administrador           | Cadastrar, editar e excluir clientes e serviços.                       | Administrador autenticado   | Dados atualizados na base.               |
| UC-006 | Exportar Dados                    | Administrador           | Gerar arquivos PDF/Excel para relatórios e propostas.                  | Dados disponíveis           | Arquivo exportado.                       |

---

## 🔒 Segurança

- Autenticação por e-mail e senha forte
- Tokens expirados após período de inatividade
- Acesso restrito por roles
- Armazenamento seguro das informações

---

## 💼 Modelo de Negócio

- Licença de uso via assinatura mensal (SaaS)
- Implantação e treinamento inclusos no valor inicial
- Planos escaláveis por número de usuários ou módulos

---

## 🧱 Estrutura de Banco de Dados (PostgreSQL)

- **users:** nome, email, senha criptografada, role, data de criação
- **proposals:** cliente, valor total, serviços, status, data de criação
- **schedule:** cliente, data, serviço, status, responsável
- **clients:** nome, contato, endereço, histórico
- **services:** nome, descrição, valor
- **products:** nome, descrição, valor
- **reports:** tipo, período, dados gerados

---

## 📆 Cronograma por Etapas (Sprints)

| Etapa                                | Duração Estimada | Descrição                                       |
| ------------------------------------ | ---------------- | ----------------------------------------------- |
| Sprint 1 - Planejamento              | 3 dias           | Levantamento de requisitos e estrutura inicial. |
| Sprint 2 - Backend Inicial           | 5 dias           | Autenticação, cadastro de usuários, API base.   |
| Sprint 3 - Frontend Inicial          | 4 dias           | Layout inicial, telas de login e dashboard.     |
| Sprint 4 - Módulo de Propostas        | 6 dias           | CRUD de propostas e exportação PDF/Excel.       |
| Sprint 5 - Módulo de Cronograma       | 5 dias           | Registro e visualização de agendamentos.        |
| Sprint 6 - Módulo de Relatórios       | 4 dias           | Geração e visualização de relatórios.           |
| Sprint 7 - Ajustes Finais e Deploy    | 2 dias           | Testes finais e publicação.                     |

**Total estimado: 29 dias úteis**
