# Planning Poker Angular Application

Uma aplicação de Planning Poker desenvolvida em Angular com comunicação em tempo real via WebSockets.

## Pré-requisitos

- Node.js (versão 18 ou superior)
- Angular CLI (`npm install -g @angular/cli`)
- Backend NestJS rodando na porta 3000

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

1. Acesse ``

## Estrutura do Projeto

```
src/app/
├── components/          # Componentes da aplicação
│   ├── home/           # Tela inicial
│   ├── room/           # Sala de votação
│   ├── voting-cards/   # Cards de votação
│   ├── invite-modal/   # Modal de convite
│   ├── task-modal/     # Modal de tarefa
│   └── timer/          # Componente de timer
├── services/           # Serviços (Socket.IO)
├── interfaces/         # Interfaces TypeScript
└── app.routes.ts      # Rotas da aplicação
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
