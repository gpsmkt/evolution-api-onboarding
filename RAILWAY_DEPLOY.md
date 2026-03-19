# GUIA RAILWAY - DEPLOY EM 5 MINUTOS

## O que é Railway?
É uma plataforma grátis que roda sua aplicação na nuvem. Você ganha um domínio público automaticamente.

## Passo 1: Criar conta no Railway (2 minutos)

1. Abra: https://railway.app
2. Clique em "Start Free"
3. Faça login com GitHub (se não tiver, crie uma conta no GitHub primeiro)
4. Autorize o Railway

## Passo 2: Criar um repositório no GitHub (2 minutos)

1. Abra: https://github.com/new
2. Nome do repositório: `evolution-api-onboarding`
3. Descrição: "Evolution API com onboarding de QR"
4. Marque "Public"
5. Clique em "Create repository"

## Passo 3: Fazer upload dos arquivos (2 minutos)

No GitHub, na página do repositório novo:

1. Clique em "uploading an existing file"
2. Arraste os seguintes arquivos para o navegador:
   - docker-compose.yml
   - .env
   - railway.json
   - .gitignore
   - onboarding/Dockerfile
   - onboarding/package.json
   - onboarding/app.js

3. Clique em "Commit changes"

## Passo 4: Conectar Railway ao GitHub (1 minuto)

1. Volte ao Railway: https://railway.app/dashboard
2. Clique em "New Project"
3. Escolha "Deploy from GitHub"
4. Procure por "evolution-api-onboarding"
5. Clique em "Deploy"

## Pronto!

Em 2-3 minutos, você terá:
- Um domínio público: `ALGO-ALGO-ALGO.railway.app`
- Sua API rodando
- HTTPS automático

## Testando

Seu endpoint vai estar em:

```
POST https://ALGO-ALGO-ALGO.railway.app/public/create-and-qrcode
```

Com o header:
```
Authorization: Bearer beb07f525770955b6a6dfab85e1d89360b62ed6aabb730082399e86ee6f01cae
```

## Importante

- Railway oferece 5 dólares de crédito grátis por mês
- Sua API de onboarding cabe fácil nisso
- Se precisar de Evolution API + Postgres no Railway também, vai custar uns 10-15 dólares/mês

Por enquanto, a API de onboarding está rodando. Você ainda precisa de um servidor separado para Evolution API + Postgres.
