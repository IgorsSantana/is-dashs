# Setup Firebase - Passo a Passo

## ✅ 1. Firestore Database
1. Firebase Console → Build → Firestore Database
2. Se não criou ainda: **Criar banco de dados**
3. Modo: **Modo de produção** (mais seguro que teste)
4. Local: escolha a mais próxima (ex: us-central1)
5. **Habilitar**

### Criar Coleções
No Firestore, crie estas coleções (estrutura):

```
📁 users (coleção)
   📄 admin-ti (documento) { username, password, company, department, isAdminTI: true, isAdmin: true }
   📄 admin (documento) { username, password, company, department, isAdmin: true }

📁 reports (coleção)
   📄 emmanuel (documento) { name, url, icon, departments: ['gerencia','financeiro','vendas'], specificUsers }

📁 companies (coleção)
   📄 company_matriz (documento) { name: 'Matriz', code: 'matriz' }
   📄 company_loja_01 (documento) { name: 'Loja 01', code: 'loja-01' }
```

**OU** deixe vazio - o app irá criar automaticamente.

---

## ✅ 2. Configuração de Segurança do Firestore

**IMPORTANTE**: Configure as regras de segurança!

Firestore Console → **Regras** → Cole e salve:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para usuários autenticados
    // Como ainda não temos auth, permitir read/write temporário
    match /{document=**} {
      allow read, write: if true;  // ⚠️ TEMPORÁRIO - PÚBLICO
    }
  }
}
```

**AVISO**: As regras acima permitem acesso público. Para produção, configure autenticação:
- Firebase Authentication
- Regras mais restritivas

---

## ✅ 3. Copiar Configuração Completa

1. Firebase Console → ⚙️ → Configurações do Projeto
2. Em "Seus apps" → clique no ícone Web (</>)
3. Copie o código completo
4. Cole no arquivo `config/firebase-config.js`

**Exemplo:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBd3B66JI5IRdvbRCx7zZazIvMiXa3De_c",
    authDomain: "is-dashs-XXXXX.firebaseapp.com",
    projectId: "is-dashs",
    storageBucket: "is-dashs.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456ghi789"
};
```

---

## ✅ 4. Testar

1. Abra o app
2. Console do navegador (F12)
3. Se aparecer "Firebase não disponível, usando localStorage" → não configurou ainda
4. Se funcionar → dados serão salvos no Firestore

---

## 🎯 Próximos Passos

### Adicionar Autenticação Firebase (Opcional)
Para segurança real:
1. Firebase → Authentication → Começar
2. Habilitar provedores (Email/Password)
3. Integrar no app

### Melhorar Regras de Segurança
Depois de adicionar auth:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📦 Status Atual

- ✅ Firebase SDK adicionado
- ✅ Funções adaptadas (async/await)
- ✅ Fallback para localStorage mantido
- ⏳ Aguardando configuração completa do Firestore
- ⏳ Aguardando authDomain/appId/messagingSenderId corretos

**O app funcionará com localStorage até você configurar o Firestore.**

