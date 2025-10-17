# MagitechRPG II

<div align="center">
  <img src="public/logo.png" alt="MagitechRPG Logo" width="200" />
  <br>
  <strong>Sistema de gerenciamento de campanhas e fichas de personagem para o RPG MagitechRPG</strong>
</div>

## Sobre o Projeto

MagitechRPG II é uma aplicação web moderna desenvolvida para gerenciar campanhas e fichas de personagem do sistema de RPG de mesa MagitechRPG. A plataforma oferece uma interface intuitiva para mestres e jogadores criarem, gerenciarem e acompanharem suas aventuras em um mundo que combina elementos de magia e tecnologia.

## Sobre o MagitechRPG (O Jogo)

MagitechRPG é um sistema de RPG de mesa original que combina elementos de fantasia e tecnologia em um universo único onde a magia e a tecnologia coexistem e se complementam. O sistema possui:

- **8 Classes**: Combatente, Especialista, Feiticeiro, Bruxo, Monge, Druida, Arcano e Ladino
- **Sistema de Atributos**: Vigor, Destreza, Foco, Lógica, Sabedoria, Carisma e outros
- **Maestrias Elementais**: Fogo, Água, Terra, Ar, Eletricidade, Trevas, Luz e Não-elemental
- **Subclasses**: Especializações disponíveis a partir do nível 10
- **Sistema de Perícias**: Diversas perícias customizáveis baseadas em atributos
- **Mecânica de Dados Personalizados**: Sistema flexível de rolagem de dados para resolução de ações
- **Inventário Completo**: Gestão de armas, armaduras, itens e munição
- **Progressão de Níveis**: Desenvolvimento de personagem com habilidades desbloqueáveis

## Tecnologias Utilizadas

- **Frontend**:
  - Next.js 14
  - React 18
  - Material-UI v5
  - React Hook Form + Zod
  - Framer Motion
  - TanStack Query (React Query)

- **Backend**:
  - Next.js API Routes
  - MongoDB / Mongoose
  - NextAuth para autenticação
  - Pusher para funcionalidades em tempo real

- **DevOps**:
  - ESLint e Prettier
  - TypeScript
  - PWA-ready

## Funcionalidades Principais

- **Dashboard do Jogador**: Interface intuitiva para gerenciar personagens
- **Dashboard do Mestre**: Ferramentas para administrar campanhas e jogadores
- **Fichas Interativas**: Criação e edição detalhada de personagens
- **Sistema de Campanhas**: Criação e gestão de campanhas com múltiplos jogadores
- **Rolagem de Dados**: Sistema visual para rolagem de dados customizáveis
- **Grimório de Magias**: Gerenciamento de magias por elemento e nível
- **Notificações**: Sistema de notificações em tempo real
- **Interface Responsiva**: Experiência otimizada para desktop e dispositivos móveis

## Como Instalar e Executar

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/MagitechRPG_II.git

# Entre no diretório do projeto
cd MagitechRPG_II

# Instale as dependências
npm install
# ou
yarn install

# Configure as variáveis de ambiente
# Crie um arquivo .env.local baseado no exemplo .env

# Execute o servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação.

## Requisitos

- Node.js 18.17.0 ou superior
- MongoDB

## PWA

MagitechRPG II é uma Progressive Web App (PWA), o que significa que pode ser instalada em dispositivos móveis e desktop para uma experiência nativa.

## Desenvolvido por

[Seu Nome/Equipe] - [Link para GitHub ou site]

## Licença

Este projeto está licenciado sob a [Licença XYZ] - veja o arquivo LICENSE para mais detalhes.
