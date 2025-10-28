# Como Migrar para Firebase (Compartilhar Dados entre Computadores)

## Problema Atual
O app usa `localStorage`, que armazena dados **apenas no navegador de cada computador**. Cada usuário tem seus próprios dados.

## Solução: Firebase Firestore
Integração com Firebase para **compartilhar dados entre todos os computadores** em tempo real.

---

## Passo a Passo

### 1. Criar Projeto no Firebase
1. Acesse: https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Nome: "is-dashs" (ou outro)
4. Continue → Desmarque Google Analytics (opcional)
5. Criar projeto

### 2. Configurar Firestore (Banco de Dados)
1. No menu lateral: **Build** → **Firestore Database**
2. **Criar banco de dados**
3. Escolha **"Começar no modo de teste"** (grátis para desenvolvimento)
4. Localização: escolha a mais próxima do Brasil
5. **Habilitar**

### 3. Configurar Autenticação Web
1. No menu lateral: **Build** → **Authentication**
2. Clique em **"Começar"**
3. Vá em **"Web App"** no topo
4. Dê um nome: "is-dashs-web"
5. Você verá um código de configuração (não precise copiar ainda)

### 4. Adicionar Credenciais ao App
1. No Firebase Console, vá em **⚙️ Configurações do Projeto**
2. Role até **"Seus apps"**
3. Clique no ícone **`</>`** (para web)
4. Você verá algo como:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "is-dashs.firebaseapp.com",
     projectId: "is-dashs",
     storageBucket: "is-dashs.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### 5. Criar Arquivo de Configuração
Crie o arquivo `config/firebase-config.js` com seu código do Firebase:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

### 6. Adicionar SDKs do Firebase
Adicione antes do `</body>` em `index.html` e `dashboard.html`:

```html
<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js"></script>
<script src="config/firebase-config.js"></script>
<script>
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
</script>
```

### 7. Atualizar Funções
Substituir `localStorage` por `db` (Firestore) no arquivo `js/auth.js`.

---

## Alternativa Mais Simples (Temporário)

Se quiser compartilhar dados **apenas entre poucos computadores** sem configurar Firebase:

### Opção A: Exportar/Importar Dados
- Exportar dados de um computador
- Compartilhar arquivo
- Importar no outro computador

### Opção B: Usar Google Sheets como Banco
- Criar uma planilha compartilhada
- Usar Google Sheets API
- Mais complexo que Firebase

---

## Recomendação

**Use Firebase Firestore** - É gratuito para pequenos volumes e sincroniza automaticamente.

Quer que eu faça a integração completa com Firebase agora?

