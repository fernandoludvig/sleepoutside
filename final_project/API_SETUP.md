# Configuração da API do Ticketmaster

## 📋 Passo a Passo para Obter a Chave da API

### 1. Criar Conta no Ticketmaster Developer
1. Acesse: https://developer.ticketmaster.com/
2. Clique em "Sign Up" para criar uma conta gratuita
3. Preencha os dados solicitados (nome, email, etc.)
4. Confirme seu email

### 2. Obter a Chave da API
1. Faça login na sua conta do Ticketmaster Developer
2. Acesse "My Account" no menu superior
3. Clique em "API Keys" no menu lateral
4. Clique em "Create New API Key"
5. Preencha:
   - **Application Name**: "Events App" (ou qualquer nome)
   - **Description**: "Aplicação para buscar eventos"
   - **API**: Selecione "Discovery API"
6. Clique em "Create"
7. **Copie a chave gerada** (formato: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 3. Configurar no Projeto
1. Abra o arquivo `js/config.js`
2. Substitua `'YOUR_TICKETMASTER_API_KEY_HERE'` pela sua chave real
3. Salve o arquivo

### 4. Testar a Integração
1. Abra o console do navegador (F12)
2. Recarregue a página
3. Você deve ver mensagens como:
   - "Fetching events from Ticketmaster API..."
   - "Found X events from Ticketmaster API"
4. Um indicador verde no canto superior direito deve aparecer: "Using Ticketmaster API"

## 🔧 Configurações Disponíveis

### No arquivo `js/config.js`:
```javascript
// Para usar dados locais (fallback)
export const USE_LOCAL_DATA = true;

// Para usar API do Ticketmaster
export const USE_LOCAL_DATA = false;
```

### Parâmetros da API:
- **countryCode**: 'BR' (Brasil)
- **locale**: 'pt-BR' (Português Brasil)
- **size**: 12 (máximo de eventos por página)
- **sort**: 'date,asc' (ordenar por data crescente)

## 🚨 Limitações da API Gratuita

- **Rate Limit**: 5000 requisições por dia
- **Requisições por minuto**: 100
- **Dados**: Apenas eventos futuros
- **Países**: Limitado a alguns países

## 🔍 Debugging

### Verificar se a API está funcionando:
1. Abra o console do navegador (F12)
2. Vá para a aba "Network"
3. Recarregue a página
4. Procure por requisições para "ticketmaster.com"
5. Verifique o status da resposta (deve ser 200)

### Mensagens de erro comuns:
- **401 Unauthorized**: Chave da API inválida
- **403 Forbidden**: Limite de requisições excedido
- **429 Too Many Requests**: Muitas requisições por minuto

## 📱 Testando no Servidor Local

1. Certifique-se de que o servidor está rodando:
   ```bash
   python3 -m http.server 8000
   ```

2. Acesse: http://localhost:8000

3. Teste a busca de eventos com diferentes termos:
   - "rock"
   - "jazz"
   - "São Paulo"
   - "Rio de Janeiro"

## 🎯 Resultado Esperado

Com a API configurada corretamente, você deve ver:
- ✅ Indicador verde: "Using Ticketmaster API"
- ✅ Eventos reais do Ticketmaster
- ✅ Imagens reais dos eventos
- ✅ Preços reais (quando disponíveis)
- ✅ Links para compra de ingressos

## 🔄 Fallback Automático

Se a API falhar, o sistema automaticamente:
1. Mostra um aviso no console
2. Usa dados locais como fallback
3. Exibe indicador amarelo: "Using Local Data"
4. Continua funcionando normalmente
