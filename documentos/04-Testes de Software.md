# 🧪 Plano de Testes de Software — TecSolutions

## CT-001 - Cadastro de Usuários

**Requisito Relacionado:** RF-001  
**Prioridade:** Alta  
**Descrição:** Testar o cadastro de usuários (nome, e-mail, senha), garantindo que todos os campos obrigatórios sejam validados e que não haja duplicidade de e-mail.

| ID        | Cenário                 | Entrada                                                                  | Resultado Esperado                      |
| --------- | ----------------------- | ------------------------------------------------------------------------ | --------------------------------------- |
| CT-001-01 | Cadastro válido         | Nome: João, E-mail: joao@email.com, Senha: ****                          | Usuário cadastrado com sucesso          |
| CT-001-02 | E-mail duplicado        | E-mail já existente no sistema                                           | Mensagem de erro informando duplicidade |
| CT-001-03 | E-mail inválido         | E-mail: "joao"                                                           | Mensagem de erro de validação           |
| CT-001-04 | Campo obrigatório vazio | Nome ou senha em branco                                                  | Mensagem de erro de campo obrigatório   |

## CT-002 - Login de Usuário

**Requisito Relacionado:** RF-002  
**Prioridade:** Alta  
**Descrição:** Validar login com e-mail e senha, garantindo autenticação correta e tratamento de falhas.

| ID        | Cenário          | Entrada                           | Resultado Esperado                                 |
| --------- | ---------------- | --------------------------------- | -------------------------------------------------- |
| CT-002-01 | Login válido     | E-mail: joao@email.com, Senha: ok | Acesso permitido e redirecionamento para dashboard |
| CT-002-02 | E-mail inexistente| E-mail não cadastrado             | Mensagem de erro                                   |
| CT-002-03 | Senha incorreta  | E-mail correto, senha errada      | Mensagem de erro                                   |
| CT-002-04 | Campos em branco | E-mail e/ou senha vazios          | Mensagem de erro de preenchimento obrigatório      |

## CT-003 - Cadastro de Propostas

**Requisito Relacionado:** RF-003  
**Prioridade:** Alta  
**Descrição:** Verificar criação de propostas comerciais com inclusão de serviços/produtos e cálculo automático do valor total.

| ID        | Cenário            | Entrada                                       | Resultado Esperado                                 |
| --------- | ------------------ | --------------------------------------------- | -------------------------------------------------- |
| CT-003-01 | Cadastro válido    | Proposta com cliente, serviços e valores      | Proposta salva com cálculo automático do total     |
| CT-003-02 | Cliente inexistente| Cliente não cadastrado                         | Mensagem de erro                                   |
| CT-003-03 | Serviço sem valor  | Serviço cadastrado sem preço                   | Mensagem solicitando valor                         |

## CT-004 - Cronograma de Atendimentos

**Requisito Relacionado:** RF-004  
**Prioridade:** Alta  
**Descrição:** Validar registro, edição e visualização de cronograma de atendimentos.

| ID        | Cenário                 | Entrada                                     | Resultado Esperado                            |
| --------- | ----------------------- | ------------------------------------------- | --------------------------------------------- |
| CT-004-01 | Cadastro válido         | Atendimento com data, cliente e serviço     | Registro salvo e visível no cronograma        |
| CT-004-02 | Data inválida           | Data no passado                              | Mensagem de erro                              |
| CT-004-03 | Filtro por período      | Mês: 08/2025                                 | Lista filtrada corretamente                   |

## CT-005 - Relatórios

**Requisito Relacionado:** RF-006  
**Prioridade:** Média  
**Descrição:** Testar geração e exportação de relatórios.

| ID        | Cenário                | Entrada                       | Resultado Esperado                       |
| --------- | ---------------------- | ----------------------------- | ---------------------------------------- |
| CT-005-01 | Relatório por período  | Período 01/2025 a 06/2025      | Relatório gerado                         |
| CT-005-02 | Exportação PDF         | Relatório selecionado          | Arquivo PDF baixado                      |
| CT-005-03 | Exportação Excel       | Relatório selecionado          | Arquivo XLSX baixado                      |

## CT-006 - Painel do Administrador

**Requisito Relacionado:** RF-009  
**Prioridade:** Média  
**Descrição:** Verificar acesso ao painel com visão geral de propostas, cronograma, clientes e relatórios.

| ID        | Cenário                     | Entrada                  | Resultado Esperado                      |
| --------- | --------------------------- | ------------------------ | --------------------------------------- |
| CT-006-01 | Acesso válido               | Admin logado             | Painel carregado com dados              |
| CT-006-02 | Usuário comum tenta acessar | Login com usuário normal | Acesso negado com mensagem de permissão |

## CT-007 - Logout

**Requisito Relacionado:** RF-010  
**Prioridade:** Baixa  
**Descrição:** Validar o logout e redirecionamento à tela de login.

| ID        | Cenário         | Entrada                    | Resultado Esperado                             |
| --------- | --------------- | -------------------------- | ---------------------------------------------- |
| CT-007-01 | Logout manual   | Clique no botão "Sair"     | Sessão encerrada e redirecionamento para login |
| CT-007-02 | Sessão expirada | Inatividade por 30 minutos | Sessão finalizada automaticamente              |

---

# 🧾 Evidências de Testes

## Parte 1 - Testes Unitários

**Exemplo:**

- **Critério de Êxito:** O sistema redireciona para o dashboard após login com e-mail e senha corretos
- **CT:** CT-002-01 - Login Válido
- **Responsável pelo Teste:** Vagner Oliveira
- **Data do Teste:** ___/08/2025
- **Comentário:** Login funcionando corretamente

## Parte 2 - Testes por Pares

**Exemplo:**

- **Critério de Êxito:** O sistema registra e exibe corretamente um atendimento no cronograma
- **CT:** CT-004-01 - Cadastro válido de atendimento
- **Responsável pela Funcionalidade:** Vagner Oliveira
- **Responsável pelo Teste:** Michel Santos
- **Data do Teste:** ___/08/2025
- **Comentário:** Atendimento registrado e visível no cronograma
