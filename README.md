# 📦 BuscapEstoque — Frontend

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query/latest)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)](https://buscapestoque.vercel.app)

Interface web e PWA desenvolvida em **React 18 + Vite 8 + Tailwind CSS v4** para gerenciamento completo de **estoque, histórico de movimentações, categorias de produtos, caderneta de devedores e administração de usuários**.

Consome a API RESTful em Java/Spring Boot ([estoque-backend](https://github.com/Savio-Marques/estoque-backend)), com gerenciamento de cache e estado assíncrono via **TanStack Query v5**, autenticação JWT via **Axios Interceptors**, componentes acessíveis com **shadcn/ui + Base UI / Radix UI** e animações com **Motion**.

---

## 🔗 Links Úteis

- 🚀 **Aplicação em Produção:** [buscapestoque.vercel.app](https://buscapestoque.vercel.app)
- 📹 **Demonstração em Vídeo:** [Assista no YouTube](https://youtu.be/z7ac9HeyzKw)
- ⚙️ **Repositório do Backend (API Spring Boot):** [Savio-Marques/estoque-backend](https://github.com/Savio-Marques/estoque-backend)

---

## ✨ Funcionalidades Principais

- 🔐 **Autenticação, RBAC & Perfil:**
  - Login seguro com token JWT, sincronização de perfil (`/auth/me`) e tratamento global de `401 Unauthorized` via Axios Interceptors.
  - Rotas protegidas por autenticação (`PrivateRoute`, `PublicOnlyRoute`) e por perfil administrativo (`AdminRoute`).
  - Modal de edição de perfil e senha (`ProfileModal`).
- 📊 **Dashboard de Métricas em Tempo Real:**
  - Resumo de produtos totais, estoque baixo, itens sem estoque e total devido na caderneta com contadores animados (`NumberTicker`).
- 📦 **Gerenciamento de Estoque (`/dashboard/stock`):**
  - Cadastro, edição, incremento/decremento rápido de quantidade e filtro por status ou pesquisa com debounce (`useDebounce`).
  - Histórico recente de movimentações de estoque (`StockMovementsModal`).
- 🏷️ **Gerenciamento de Categorias (`/dashboard/categories`):**
  - Listagem, criação, edição e exclusão de categorias com modais de confirmação.
- 📒 **Caderneta de Devedores (`/dashboard/debtors`):**
  - Cadastro de clientes devedores (incluindo vínculo/baixa de itens de estoque via `AddDebtorModal`).
  - Registro de pagamento parcial, quitação integral preservando histórico e visualização de extrato detalhado (`DebtorStatementModal`).
- 👥 **Administração de Usuários (`/dashboard/users` — *`ADMIN`*):**
  - Listagem, criação, edição e remoção de contas de acesso.
- 📱 **PWA & Experiência Responsiva:**
  - Service Worker (`/sw.js`) e `manifest.webmanifest` para instalação como aplicativo web progressivo (PWA).
  - Sistema customizado de notificações (`LedgerToast`) e design acessível.

---

## 🛠️ Tecnologias e Bibliotecas

| Tecnologia | Função / Descrição |
|---|---|
| **React 18 + Vite 8** | Biblioteca de UI com bundler rápido em ESM e suporte a TypeScript |
| **Tailwind CSS v4** | Estilização utilitária com plugin oficial `@tailwindcss/vite` |
| **shadcn/ui + Base UI + Radix UI** | Primitivos acessíveis (dialogs, tabs, selects, alert-dialogs, sheets) |
| **TanStack Query (v5)** | Cache, deduplicação de requisições, queries e mutações |
| **React Router Dom (v6)** | Roteamento aninhado e proteção de rotas |
| **Axios** | Cliente HTTP com interceptores de JWT e tratamento de expiração |
| **Motion** | Transições e microinterações declarativas |
| **Lucide React & Tabler Icons** | Ícones vetoriais |

---

## 📂 Estrutura do Projeto

```text
estoque-frontend/
├── .github/workflows/ci.yml        # Pipeline CI de build no GitHub Actions
├── public/                         # Ícones, manifest.webmanifest, robots.txt e sw.js (PWA)
├── src/
│   ├── components/
│   │   ├── AddDebtorModal/         # Cadastro de devedor com vínculo de produtos
│   │   ├── AddProductForm/         # Formulário de criação de produtos
│   │   ├── ConfirmationModal/      # Modal genérico de confirmação
│   │   ├── DebtorStatementModal/   # Extrato e pagamentos de devedores
│   │   ├── EditCategoryModal/      # Edição de categorias
│   │   ├── EditDebtorModal/        # Edição de devedores
│   │   ├── EditProductModal/       # Edição de produtos
│   │   ├── LedgerToast/            # Viewport e notificações toast customizadas
│   │   ├── Modal/                  # Modal base acessível
│   │   ├── ProductFormPrimitives/  # Campos reutilizáveis de produto
│   │   ├── ProfileModal/           # Edição de perfil e senha
│   │   ├── StockMovementsModal/    # Histórico de movimentações de estoque
│   │   ├── PrivateRoute/           # Guard de rotas autenticadas
│   │   ├── motion/                 # Componentes animados (InsightCard, NumberTicker)
│   │   ├── spaceui/                # Badges de status
│   │   ├── ui/                     # Primitivos shadcn/ui (Button, Dialog, Input, Tabs, etc.)
│   │   └── velora/                 # Fundos e padrões visuais
│   ├── contexts/AuthContext.js     # Estado global de autenticação (JWT e usuário)
│   ├── hooks/                      # Hooks de dados e UI (useProducts, useCategories, useDebtors, useUsers, etc.)
│   ├── lib/utils.ts                # Utilitário `cn` (clsx + tailwind-merge)
│   ├── pages/                      # Páginas (Login, Dashboard, Stock, Debtors, Categories, Users)
│   ├── services/api.js             # Instância Axios com interceptores
│   ├── styles/                     # Folhas de estilo auxiliares
│   ├── App.js                      # QueryClientProvider, AuthProvider e rotas
│   ├── global.css                  # Estilos globais e tokens
│   ├── index.js                    # Ponto de entrada React + registro do Service Worker
│   └── routes.js                   # Mapeamento de rotas públicas, privadas e admin
├── .env.development                # URL padrão da API local (http://localhost:10000)
├── .env.production                 # URL da API em produção (https://buscapestoque.duckdns.org)
├── vite.config.mjs                 # Configuração Vite + Tailwind v4
└── package.json                    # Dependências e scripts
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** (v20 ou superior, recomendado v22)
- **npm**

### Passos

1. **Clone o repositório e instale as dependências:**
   ```bash
   git clone https://github.com/Savio-Marques/estoque-frontend.git
   cd estoque-frontend
   npm install
   ```

2. **Confira o `.env.development` (padrão aponta para o backend na porta `10000`):**
   ```env
   REACT_APP_API_URL=http://localhost:10000
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:3000`.

---

## 📦 Build de Produção e Deploy

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `build/`. O deploy contínuo está integrado à **Vercel** com a variável `REACT_APP_API_URL` apontando para a API em produção.

---

## ✒️ Autor

Desenvolvido por **Sávio Marques**

- **GitHub:** [@Savio-Marques](https://github.com/Savio-Marques)
- **LinkedIn:** [Sávio Marques](https://www.linkedin.com/in/savio-marques)
