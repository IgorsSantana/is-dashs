# Central de Relatórios Power BI

Aplicativo web para centralizar e gerenciar acesso aos relatórios do Power BI por empresa/loja e departamento, com painel administrativo completo.

## 📋 Características

- ✅ Login com usuário e senha
- ✅ Controle de acesso baseado em permissões por departamento
- ✅ Interface com barra lateral para navegação
- ✅ Painel administrativo (apenas para admins)
- ✅ Gerenciamento de usuários (adicionar, editar, excluir)
- ✅ Gerenciamento de relatórios (adicionar, editar, excluir)
- ✅ Sistema de roles (Admin e Usuário comum)
- ✅ Design moderno e responsivo
- ✅ Armazenamento local (localStorage)

## 🚀 Como Usar

### 1. Estrutura de Arquivos

```
Dashs/
├── index.html          # Página de login
├── dashboard.html      # Dashboard principal
├── js/
│   ├── config.js      # Configuração inicial
│   ├── auth.js        # Sistema de autenticação e gerenciamento
│   ├── login.js       # Lógica de login
│   └── dashboard.js   # Lógica do dashboard
├── styles/
│   ├── login.css      # Estilos da página de login
│   └── dashboard.css  # Estilos do dashboard
└── README.md          # Este arquivo
```

### 2. Primeiro Acesso

1. Abra `index.html` no navegador
2. Use as credenciais padrão do administrador:
   - **Usuário:** `admin`
   - **Senha:** `admin123`

### 3. Login

O sistema possui dois tipos de usuários:

#### Usuário Administrador
- Pode gerenciar usuários e relatórios
- Tem acesso a todos os relatórios
- Pode adicionar, editar e excluir relatórios
- Pode criar e gerenciar usuários

#### Usuário Comum
- Visualiza apenas relatórios do seu departamento
- Acesso limitado baseado nas permissões

### 4. Painel Administrativo

Apenas admins veem o botão "Painel Admin" na sidebar.

#### Gerenciar Relatórios
1. Abra o Painel Admin
2. Na aba "Relatórios", clique em "+ Adicionar Relatório"
3. Preencha:
   - Nome do relatório
   - URL do Power BI (link público)
   - Ícone (emoji)
   - **Departamentos com acesso** - OU
   - **Usuários específicos** - Permite vincular a usuários individuais
4. Clique em "Salvar"

**Nota:** Você pode selecionar departamentos, usuários específicos, ou ambos. Se selecionar ambos, o usuário terá acesso se estiver no departamento OU se for um dos usuários específicos.

#### Gerenciar Usuários
1. Abra o Painel Admin
2. Na aba "Usuários", clique em "+ Adicionar Usuário"
3. Preencha:
   - Nome de usuário
   - Senha
   - Empresa/Loja
   - Departamento
   - Marque "Administrador" se necessário
4. Clique em "Salvar"

### 5. Obter URLs do Power BI

1. Abra seu relatório no Power BI
2. Clique em **Compartilhar** → **Incorporar no navegador**
3. Copie o link gerado
4. Cole no campo "URL do Power BI" ao criar um relatório

## 🔐 Credenciais Padrão

- **Administrador:**
  - Usuário: `admin`
  - Senha: `admin123`

⚠️ **IMPORTANTE:** Altere a senha do admin após o primeiro acesso!

## 🎨 Funcionalidades

### Sistema de Permissões

O sistema filtra automaticamente os relatórios disponíveis com base no departamento do usuário.

**Exemplo:**
- Um usuário de **Vendas** verá apenas relatórios do departamento de vendas
- Um usuário de **Gerência** terá acesso a todos os relatórios gerenciais
- Um usuário de **Financeiro** verá apenas relatórios financeiros
- Um **Admin** pode ver todos os relatórios

### Departamentos Disponíveis

- **Gerência** - Acesso a todos os relatórios
- **Financeiro** - Relatórios financeiros
- **Vendas** - Relatórios de vendas
- **Compras** - Relatórios de compras
- **RH** - Recursos Humanos
- **Operações** - Relatórios operacionais

### Empresas/Lojas Padrão

- Matriz
- Loja 01
- Loja 02
- Loja 03

## 🎯 Recursos do Painel Admin

### Gerenciamento de Relatórios
- ➕ Adicionar novos relatórios
- ✏️ Editar relatórios existentes
- 🗑️ Excluir relatórios
- 🔍 Ver lista de todos os relatórios

### Gerenciamento de Usuários
- ➕ Criar novos usuários
- ✏️ Editar informações de usuários
- 🗑️ Excluir usuários
- 🔐 Definir permissões de admin
- 🏢 Atribuir empresa e departamento

## 🔒 Segurança

**Nota:** Esta é uma versão para uso interno. Para produção:

- Implemente autenticação backend real
- Use criptografia forte para senhas
- Adicione validação de sessão no servidor
- Implemente HTTPS
- Adicione rate limiting
- Implemente backups de dados

## 📱 Uso

1. Abra `index.html` no navegador
2. Faça login com suas credenciais
3. Selecione um relatório na barra lateral
4. O relatório será carregado no painel principal
5. Admins podem acessar o Painel Admin para gerenciar o sistema

## 🛠️ Tecnologias

- HTML5
- CSS3 (com gradientes, animações e design responsivo)
- JavaScript (ES6+)
- localStorage para armazenamento

## 🎨 Recursos de Design

- Layout responsivo
- Animações suaves
- Gradientes modernos
- Interface intuitiva
- Modais elegantes
- Sistema de tabs
- Feedback visual

## 📝 Licença

Este projeto é de uso livre para fins educacionais e comerciais.

## 🆘 Suporte

Para adicionar novos relatórios, acesse o Painel Admin e use o botão "+ Adicionar Relatório".

Para criar novos usuários, acesse o Painel Admin e use o botão "+ Adicionar Usuário".

Todas as alterações são salvas automaticamente no navegador (localStorage).
