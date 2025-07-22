# Planning Poker — Frontend

Uma aplicação de **Planning Poker** desenvolvida em Angular 20, com comunicação em tempo real via WebSockets (Socket.IO).


## 🔧 Pré-requisitos

- **Node.js** ≥ 18  
- **npm** ou **pnpm**  
- **Angular CLI**  
  ```bash
  npm install -g @angular/cli
## Instalação

1. Clone ou baixe o projeto
2. Instale as dependências:

```bash
npm install
```

3. Instale as dependências específicas:

```bash
npm install socket.io-client@4.8.1 rxjs@7.8.1
```

## Executar a aplicação

1. Certifique-se de que o backend NestJS está rodando na porta 3000
2. Execute o comando:

```bash
ng serve
```

## Acessar o frontend
[Acesse a aplicação](https://planning-poker-frontend-peach.vercel.app/)


## Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── home/             # Tela inicial (join/create)
│   │   ├── room/             # Sala de votação (standalone)
│   │   ├── voting-cards/     # Cards de votação
│   │   ├── voting-table/     # Visualização circular de votos
│   │   ├── invite-modal/     # Modal de convite
│   │   └── issues-panel/     # Painel de issues
│   ├── services/
│   │   ├── socket.service.ts # Socket.IO Client
│   │   └── issues.service.ts # Persistência e broadcast de issues
│   ├── interfaces/           # Modelos TypeScript (Room, Issue, VoteResult)
│   ├── environments/         # environment.ts / environment.prod.ts
│   └── app.routes.ts         # Rotas standalone
└── styles/                   # Variáveis e utilitários CSS globais
```

## Funcionalidades

- ✅ Criar salas de estimativa
- ✅ Entrar em salas existentes
- ✅ Votação em tempo real
- ✅ Sistema de timer
- ✅ Convite de jogadores
- ✅ Estatísticas de votação
- ✅ Interface responsiva

## Tecnologias Utilizadas

- Angular 20
- TypeScript
- Socket.IO Client
- RxJS
- CSS3 com Flexbox/Grid


  
  ## Decisões Técnicas

- Angular 20 + Standalone Components
  Todos os componentes declaram standalone: true e importam apenas seus CommonModule / FormsModule / outros componentes necessários.

- Socket.IO Client
  Baixa latência e sincronização instantânea de eventos via socketUrl.

- RxJS
  Uso de BehaviorSubject e Subject para gerenciar fluxo de participantes, tarefas, votos e issues de forma reativa.

- Environments
  URLs de API e WebSocket configuráveis em environment.ts.

- LocalStorage
  Armazena userName, userRole, currentRoom, gameConfig e issues\_{roomId} para permitir reloads sem perda de estado.
  
- Arquitetura Modular
  Separação clara entre domain (IssuesService), infra (SocketService) e UI (components).

- Design & Responsividade
  Tailwind-inspired CSS custom (sem dependência de library) via Flexbox/Grid para layouts fluidos.

- Deploy Frontend
  Vercel para hospedagem estática do bundle Angular, CI/CD automático a partir do GitH

- Orquestração de CSS
  Estilos de componente inline e global mix, evitando dependências externas (Tailwind, Bootstrap etc.).

- Budgets
  O Angular CLI impõe orçamentos de tamanho por componente. Se o CSS inline exceder (~10 KB), ajuste angular.json:
  ```
  "budgets": [
  {
  "type": "initial",
  "maximumWarning": "500kb",
  "maximumError": "1mb"
  },
  {
  "type": "anyComponentStyle",
  "maximumWarning": "20kb",
  "maximumError": "30kb"
  }
  ]
  ```


