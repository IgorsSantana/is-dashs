# 📦 Armazenamento de Dados

## Onde os dados ficam salvos

Todos os dados (usuários, relatórios, empresas, departamentos) são armazenados no **localStorage** do navegador.

### localStorage - Navegador do Usuário

```
localStorage.setItem('users', JSON.stringify(users))       // Usuários do sistema
localStorage.setItem('reports', JSON.stringify(reports)) // Relatórios Power BI
localStorage.setItem('companies', JSON.stringify(companies)) // Empresas/Lojas
localStorage.setItem('session', JSON.stringify(session))  // Sessão atual do usuário
```

### Onde fica o localStorage?

- **Chrome/Edge:** `C:\Users\[seu-usuario]\AppData\Local\Google\Chrome\User Data\Default\Local Storage`
- **Firefox:** `C:\Users\[seu-usuario]\AppData\Roaming\Mozilla\Firefox\Profiles\[perfil]\webappsstore.sqlite`
- **Safari:** `~/Library/Safari/LocalStorage`

## Problemas do localStorage

1. ❌ **Não sincroniza entre navegadores**
2. ❌ **Não sincroniza entre dispositivos**
3. ❌ **Pode ser limpo a qualquer momento**
4. ❌ **Cada pessoa tem sua própria copia**

## Soluções

### ✅ Opção 1: Servidor Backend
Conectar a um banco de dados real (MongoDB, PostgreSQL, Firebase, etc.)

### ✅ Opção 2: Firebase (GRATUITO)
- Banco de dados em nuvem gratuito
- Sincroniza em tempo real
- **Sem backend necessário!**

### ✅ Opção 3: Supabase (GRATUITO)
- PostgreSQL em nuvem
- API REST automática
- **Também gratuito!**

## Recomendação

Para seu caso, **Firebase** seria perfeito:
- ✅ Gratuito
- ✅ Fácil de integrar
- ✅ Sincronização automática
- ✅ Autenticação pronta
- ✅ Sem servidor necessário

Posso implementar Firebase para vocês se quiserem!

