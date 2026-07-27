# 📦 BuscapEstoque — Frontend

![Status do Projeto](https://img.shields.io/badge/status-conclu%C3%ADdo-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5.0-FF4154?logo=reactquery&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-v6-CA4245?logo=reactrouter&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-blue)

Uma aplicação web moderna, responsiva e de alta performance desenvolvida em **React 18** para gerenciamento completo de **estoque, categorias de produtos e controle de pagamentos pendentes (caderneta de devedores)**.

A interface consome a API RESTful construída em Java com Spring Boot, oferecendo gerenciamento de estado assíncrono com **TanStack Query (React Query)**, autenticação centralizada com **JWT via Axios Interceptors**, proteção de rotas e conformidade com **acessibilidade (WCAG)** e **SEO**.

---

## 🔗 Links Úteis e Demonstração

- 🚀 **Aplicação em Produção:** [buscapestoque.vercel.app](https://buscapestoque.vercel.app)
- 📹 **Demonstração em Vídeo:** [Assista no YouTube](https://youtu.be/z7ac9HeyzKw)
- ⚙️ **Repositório do Backend (API Spring Boot):** [Savio-Marques/estoque-backend](https://github.com/Savio-Marques/estoque-backend)

---

## ✨ Funcionalidades Principais

- 🔐 **Autenticação & Segurança Robustas:**
  - Login seguro com token JWT.
  - **Axios Interceptors** para injeção automática de `Authorization: Bearer <token>` e tratamento global de expiração de sessão (`401 Unauthorized`).
  - **Proteção de Rotas (`PrivateRoute` e `PublicOnlyRoute`)** impedindo acessos não autorizados a URLs internas e redirecionando automaticamente usuários autenticados.
- 📊 **Dashboard de Métricas em Tempo Real:**
  - Resumo de total de produtos, itens com estoque baixo (≤ 5 un.) e itens sem estoque (0 un.).
  - Cartões de estatísticas interativos com contadores em tempo real.
- 📦 **Gerenciamento de Estoque (`/dashboard/stock`):**
  - Listagem em cards com status visual colorido (*Disponível*, *Estoque Baixo*, *Sem Estoque*).
  - Pesquisa rápida por nome com debounce (`useDebounce`) e filtro por status de estoque.
  - Incremento e decremento rápido de quantidade com 1 clique (`Adicionar` / `Retirar`).
  - Cadastro e edição de produtos via modal.
- 🏷️ **Gerenciamento de Categorias (`/dashboard/categories`):**
  - Listagem, cadastro, edição e exclusão de categorias com modais de confirmação.
- 📒 **Caderneta de Devedores / Pagamentos Pendentes (`/dashboard/debtors`):**
  - Controle de clientes com saldo devedor, descrição e valor total acumulado.
  - Ação rápida para dar baixa em pagamentos efetuados (*Marcar como Pago*).
- 📱 **Design 100% Responsivo & Acessível (WCAG):**
  - Layout adaptável para smartphones, tablets e desktops.
  - Suporte completo a navegação por teclado (`:focus-visible` e tecla `Escape` para fechar modais).
  - Labels acessíveis e suporte a leitores de tela (`aria-label`, `role="dialog"`, `aria-modal="true"`).

---

## 🛠️ Tecnologias e Bibliotecas

| Tecnologia | Função / Descrição |
|---|---|
| **React 18** | Biblioteca principal para construção da interface declarativa em componentes. |
| **TanStack Query (v5)** | Gerenciamento de estado remoto, caching, deduplicação de requisições e mutações com invalidação granular. |
| **React Router Dom (v6)** | Roteamento declarativo com suporte a rotas aninhadas (`Outlet`) e rotas privadas. |
| **Axios** | Cliente HTTP com interceptores configurados para autenticação e tratamento de erros. |
| **Lucide React** | Biblioteca de ícones vetoriais modernos e leves. |
| **React Toastify** | Sistema de notificações flutuantes (toasts) para feedback ao usuário. |
| **HTML5 & CSS3 Vanilla** | Estilização flexível com variáveis CSS, Grid, Flexbox e `@media queries`. |

---

## 📂 Estrutura do Projeto

```text
estoque-frontend/
├── public/
│   ├── box.ico               # Favicon da aplicação
│   ├── index.html            # HTML principal (SEO e Meta tags)
│   └── robots.txt            # Regras de rastreamento para buscadores
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── AddProductForm/   # Formulário de criação de produtos
│   │   ├── ConfirmationModal/# Modal genérico de confirmação
│   │   ├── EditCategoryModal/# Modal de edição de categorias
│   │   ├── EditDebtorModal/  # Modal de edição de devedores
│   │   ├── EditProductModal/ # Modal de edição de produtos
│   │   ├── Modal/            # Componente base de Modal acessível
│   │   └── PrivateRoute/     # Guard de rotas autenticadas
│   ├── contexts/
│   │   └── AuthContext.js    # Contexto global de autenticação (JWT e User State)
│   ├── hooks/
│   │   └── useDebounce.js    # Hook customizado para atraso na busca
│   ├── pages/                # Páginas da aplicação (Rotas)
│   │   ├── Categories/       # Gestão de Categorias
│   │   ├── Dashboard/        # Layout principal com Navegação e Stats
│   │   ├── Debtors/          # Caderneta de Devedores
│   │   ├── Login/            # Tela de Autenticação
│   │   └── Stock/            # Gestão de Estoque de Produtos
│   ├── services/
│   │   └── api.js            # Instância do Axios com Interceptors
│   ├── App.js                # Provedores Globais (QueryClientProvider & AuthProvider)
│   ├── global.css            # Estilos globais, tipografia e regras de foco
│   ├── index.js              # Ponto de entrada React
│   └── routes.js             # Mapeamento de rotas da aplicação
├── .env.development          # Variáveis de ambiente de desenvolvimento
├── .env.production           # Variáveis de ambiente de produção (Vercel)
└── package.json              # Dependências e scripts do projeto
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (v16.0 ou superior)
- **NPM** ou **Yarn**

### 1. Clonar o repositório
```bash
git clone https://github.com/Savio-Marques/estoque-frontend.git
cd estoque-frontend
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Crie um arquivo `.env.development` na raiz do projeto (se não existir) apontando para o seu backend local ou remoto:

```env
REACT_APP_API_URL=http://localhost:8080
```

### 4. Iniciar o servidor de desenvolvimento
```bash
npm start
```
A aplicação estará disponível em `http://localhost:3000`.

---

## 📦 Build de Produção e Deploy

Para gerar o pacote otimizado e minificado para produção:

```bash
npm run build
```

Os arquivos prontos serão gerados na pasta `build/` (~97 KB gzippado).

### Deploy na Vercel
A aplicação é totalmente compatível com a **Vercel**:
1. Conecte o repositório do GitHub na Vercel.
2. Adicione a variável de ambiente `REACT_APP_API_URL` com a URL `HTTPS` da sua API backend (ex: `https://buscapestoque.duckdns.org`).
3. O deploy será realizado automaticamente.

---

## ✒️ Autor

Desenvolvido por **Sávio Marques** 👋
- **GitHub:** [@Savio-Marques](https://github.com/Savio-Marques)
- **LinkedIn:** [Sávio Marques](https://www.linkedin.com/in/savio-marques)

---

## 📄 Licença

Este projeto está sob a licença [MIT](./LICENSE).
