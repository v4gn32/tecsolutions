-- ✅ cria o enum se não existir
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ClientType') THEN
    CREATE TYPE "ClientType" AS ENUM ('CONTRATO', 'AVULSO');
  END IF;
END $$;

-- ✅ adiciona colunas novas preenchendo linhas existentes
ALTER TABLE "Client"
  ADD COLUMN IF NOT EXISTS "type" "ClientType" NOT NULL DEFAULT 'AVULSO',
  ADD COLUMN IF NOT EXISTS "contractStart" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "contractEnd" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW();

-- ⚠️ Se aqui existir criação de UNIQUE em "cnpj" ou "email" e você tiver duplicados,
-- comente essas linhas por enquanto; criaremos o índice depois de limpar dados.
