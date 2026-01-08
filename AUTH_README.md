# Sistema de Autenticação - Process Manager

## 📋 Resumo da Implementação

Sistema completo de autenticação JWT com login, cadastro, gerenciamento de sessão e proteção de rotas.

## 🎯 Funcionalidades Implementadas

### ✅ 1. Tela de Login (`/login`)
- Formulário de login com validação
- Link para criar nova conta
- Redirecionamento automático se já autenticado
- Design seguindo o padrão do projeto

### ✅ 2. Modal de Sign-up
- Criação de conta com nome, email e senha
- Seleção de cor personalizada para o avatar
- Validação de formulário
- Feedback com toast notifications

### ✅ 3. Gerenciamento de Estado (Zustand)
- Store global de autenticação
- Persistência no localStorage
- Decodificação automática do JWT
- Validação de token expirado

### ✅ 4. UserMenu no Header
- Avatar colorido com inicial do nome
- Nome e email do usuário
- Menu dropdown com opção de logout
- Aparece no canto direito do header

### ✅ 5. Proteção de Rotas
- Redirecionamento automático para `/login` se não autenticado
- Redirecionamento para `/` se já autenticado tentando acessar login
- Loading state durante verificação de autenticação

### ✅ 6. Interceptores Axios
- Token JWT adicionado automaticamente em todas as requisições
- Header: `Authorization: Bearer <token>`
- Redirecionamento automático para login em caso de 401

## 📁 Estrutura de Arquivos Criados/Modificados

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx                    # ✨ Nova página de login
│   └── layout.tsx                      # 🔄 Modificado (usa AppLayout)
│
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx            # ✨ Provider de autenticação
│   │   └── SignUpModal.tsx             # ✨ Modal de cadastro
│   │
│   ├── layout/
│   │   ├── AppLayout.tsx               # ✨ Layout condicional
│   │   ├── Header.tsx                  # 🔄 Modificado (+ UserMenu)
│   │   └── UserMenu.tsx                # ✨ Menu do usuário
│   │
│   └── Providers.tsx                   # 🔄 Modificado (+ AuthProvider)
│
├── lib/
│   ├── axios.ts                        # 🔄 Modificado (+ interceptors)
│   └── jwt.ts                          # ✨ Helpers de JWT
│
├── services/
│   └── auth.ts                         # ✨ Serviço de autenticação
│
├── store/
│   └── useAuthStore.ts                 # ✨ Store Zustand
│
└── types/
    └── index.ts                        # 🔄 Modificado (+ tipos Auth)
```

## 🚀 Como Usar

### 1. Criar uma nova conta

```typescript
// Acesse /login e clique em "Criar conta"
// Preencha: nome, email, senha
// Escolha uma cor para seu avatar
// Clique em "Criar Conta"
```

### 2. Fazer Login

```typescript
// Acesse /login
// Digite email e senha
// Clique em "Entrar"
// Será redirecionado para /
```

### 3. Usar o User no código

```typescript
import { useAuthStore } from '@/store/useAuthStore';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  if (!isAuthenticated) {
    return <div>Não autenticado</div>;
  }
  
  return (
    <div>
      <p>Olá, {user?.name}!</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

### 4. Fazer requisições autenticadas

```typescript
import api from '@/lib/axios';

// O token é adicionado automaticamente!
const response = await api.get('/departments');
const departments = response.data;
```

### 5. Fazer Logout

```typescript
// Clique no avatar no canto direito do header
// Clique em "Sair"
// Será redirecionado para /login
```

## 🔐 Segurança

- ✅ Token JWT armazenado no localStorage
- ✅ Validação de expiração do token
- ✅ Redirecionamento automático em 401
- ✅ Senha nunca armazenada no frontend
- ✅ Token enviado via header Authorization

## 🎨 Personalização

### Cores disponíveis para avatar:
- Azul (#3b82f6)
- Verde (#10b981)
- Roxo (#8b5cf6)
- Rosa (#ec4899)
- Laranja (#f59e0b)
- Vermelho (#ef4444)

### Ícones disponíveis:
- FiUser, FiStar, FiHeart, FiSmile, FiZap, FiCoffee

## 📝 Notas Importantes

1. **Token no localStorage**: O token é salvo em `localStorage.token`
2. **Decodificação JWT**: O frontend decodifica o token para extrair id e email
3. **Nome temporário**: Se o usuário não tiver nome no token, usa o prefixo do email
4. **Proteção de rotas**: Todas as rotas exceto `/login` exigem autenticação
5. **HTTPS**: Em produção, use HTTPS para proteger o token em trânsito

## 🧪 Testando

1. Inicie o backend: `cd process_manager_backend && npm run start:dev`
2. Inicie o frontend: `cd process_manager_frontend && npm run dev`
3. Acesse: `http://localhost:3000/login`
4. Crie uma conta e faça login!

## 🐛 Troubleshooting

**Problema**: Não consigo fazer login
- Verifique se o backend está rodando
- Verifique as credenciais
- Veja o console do navegador para erros

**Problema**: Token não está sendo enviado
- Limpe o localStorage
- Faça login novamente
- Verifique o Network tab do DevTools

**Problema**: Redirecionamento infinito
- Limpe o localStorage: `localStorage.clear()`
- Recarregue a página

## 📚 Tecnologias Utilizadas

- Next.js 14
- TypeScript
- Zustand (gerenciamento de estado)
- Axios (HTTP client)
- React Hot Toast (notificações)
- Tailwind CSS (estilização)
- Framer Motion (animações)

