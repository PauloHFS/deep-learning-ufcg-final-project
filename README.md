# Classificador de Imagens com TensorFlow.js

Este é um projeto de final de disciplina de Deep Learning da UFCG. Trata-se de uma aplicação web moderna, single-page e mobile-first, construída com React e TypeScript, que utiliza TensorFlow.js para realizar classificação de imagens diretamente no navegador do cliente.

A aplicação oferece uma interface de usuário polida e intuitiva, com um tema escuro, animações suaves e uma experiência de câmera que se assemelha a um aplicativo nativo.

## Features

- **Classificação no Cliente:** Utiliza o modelo MobileNet via TensorFlow.js para classificar imagens sem a necessidade de um servidor backend.
- **Interface Responsiva (Mobile-First):** Design e layout construídos com Tailwind CSS, focados em oferecer a melhor experiência em dispositivos móveis.
- **Experiência de Câmera Nativa:** Acesso à câmera do dispositivo em tela cheia para uma captura de imagem imersiva.
- **Upload de Arquivos:** Como alternativa à câmera, os usuários podem enviar uma imagem de seus dispositivos.
- **UI Reativa e Polida:** Animações suaves e transições de estado gerenciadas com Framer Motion.
- **Carregamento Proativo:** O modelo de Machine Learning é carregado em segundo plano assim que a aplicação inicia, para que esteja pronto para uso imediato.

## Tech Stack

- **Frontend:** [React](https://react.dev/) (com Hooks)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Machine Learning:** [TensorFlow.js](https://www.tensorflow.org/js) (com o modelo [MobileNet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet))

## Como Rodar o Projeto

Para executar este projeto localmente, siga os passos abaixo.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18.x ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

### Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/deep-learning-ufcg-final-project.git
    cd deep-learning-ufcg-final-project
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  Abra seu navegador e acesse `http://localhost:5173` (ou o endereço indicado no seu terminal).

## Como Contribuir

Contribuições são bem-vindas! Se você deseja melhorar este projeto, por favor, siga estas diretrizes.

1.  **Faça um Fork** do repositório.
2.  **Crie uma nova branch** para sua feature ou correção de bug:
    ```bash
    git checkout -b minha-feature-incrivel
    ```
3.  **Faça suas alterações** e realize o commit delas com mensagens claras.
4.  **Envie suas alterações** para o seu fork:
    ```bash
    git push origin minha-feature-incrivel
    ```
5.  **Abra um Pull Request** no repositório original para que suas alterações possam ser revisadas.

---
*Este projeto foi desenvolvido como parte da disciplina de Deep Learning da Universidade Federal de Campina Grande (UFCG).*
