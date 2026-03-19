# Evolution API Onboarding

API de onboarding para Evolution API com geração de QR Code em base64.

## Tecnologias

- Node.js 20
- Express
- QRCode

## Variáveis de Ambiente

```
PORT=3001
EVOLUTION_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua_chave_aqui
INTERNAL_AUTH_TOKEN=seu_token_aqui
DEFAULT_WEBHOOK_URL=https://seu-dominio/public/webhook/evolution
```

## Endpoints

- `GET /public/health` - Health check
- `POST /public/create-and-qrcode` - Cria instância e retorna QR em base64
- `GET /public/qrcode/:instanceName` - Busca QR atualizado
- `POST /public/webhook/evolution` - Recebe webhooks da Evolution

## Como usar

```bash
npm install
npm start
```
