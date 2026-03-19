# Roteiro simples para colocar em produção

## 1. VOCÊ PRECISA DE:
- Um servidor Linux (Ubuntu 22.04 ou 20.04)
- SSH para acessar o servidor
- Um domínio (pode comprar depois)

## 2. PASSO A PASSO:

### Passo 1: Acesse seu servidor via SSH
```
ssh root@seu_ip_do_servidor
# ou
ssh usuario@seu_ip_do_servidor
```

### Passo 2: Instale Docker e Docker Compose
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

### Passo 3: Crie a pasta
```bash
mkdir -p /opt/evolution-stack/onboarding
cd /opt/evolution-stack
```

### Passo 4: Copie os arquivos
Coloque esses arquivos na pasta:
- docker-compose.yml
- .env
- onboarding/Dockerfile
- onboarding/package.json
- onboarding/app.js

### Passo 5: Edite o .env
```bash
nano .env
```

Altere apenas:
- `SERVER_URL=https://SEU_IP_PUBLICO` (ex: https://123.45.67.89)
- `POSTGRES_PASSWORD=` para algo forte (ex: suasenha123456)
- `PUBLIC_BASE_URL=https://SEU_IP_PUBLICO`

Pressione CTRL+X, depois Y, depois Enter para salvar.

### Passo 6: Suba os containers
```bash
docker compose up -d --build
```

### Passo 7: Teste
```bash
curl https://SEU_IP_PUBLICO/public/health
```

Pronto! Sua API está funcionando.

## 3. DEPOIS (DOMÍNIO + SSL):

Quando quiser adicionar um domínio:

1. Compre um domínio (namecheap.com, godaddy.com, etc)
2. Aponte o registro A para seu IP
3. Instale Nginx + Certbot
4. Suba SSL

Nessa altura eu posso te ajudar com esses passos.

## 4. SENHAS IMPORTANTES:

Guarde essas senhas em um lugar seguro:

AUTHENTICATION_API_KEY = 8a10450314b719c217e3d09fa013957fd484c31dd7e7708d9244c8b08d1b2f24
INTERNAL_AUTH_TOKEN = beb07f525770955b6a6dfab85e1d89360b62ed6aabb730082399e86ee6f01cae
POSTGRES_PASSWORD = mudar_senha_aqui (mude para uma senha forte)

Sem essas chaves, sua API não funciona.
