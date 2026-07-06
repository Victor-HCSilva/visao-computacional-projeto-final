# Assistente de Orientação Residencial com Visão Computacional

## 📖 Sobre o Projeto

O **Assistente de Orientação Residencial** é uma aplicação web desenvolvida para auxiliar pessoas com deficiência visual na identificação de objetos presentes em ambientes internos.

Utilizando técnicas de **Visão Computacional** e **Inteligência Artificial**, o sistema captura imagens da câmera do dispositivo, identifica objetos em tempo real e fornece orientações por meio de síntese de voz, permitindo que o usuário tenha maior percepção do ambiente ao seu redor.

O processamento principal é realizado **localmente no navegador**, preservando a privacidade do usuário e reduzindo a latência da aplicação.

---

## 🎯 Objetivos

* Auxiliar pessoas com deficiência visual na locomoção em ambientes internos;
* Detectar objetos utilizando Visão Computacional;
* Informar a posição aproximada dos objetos através de feedback em áudio;
* Oferecer uma interface simples e acessível;
* Demonstrar o uso de Inteligência Artificial aplicada à acessibilidade.

---

## 🚀 Funcionalidades

* 📷 Captura de vídeo utilizando a câmera do dispositivo.
* 🧠 Detecção de objetos em tempo real utilizando **TensorFlow.js** e **COCO-SSD**.
* 🔊 Feedback por voz utilizando a API **SpeechSynthesis**.
* 🎧 Sons de feedback indicando início, parada e processamento.
* 🌐 Suporte aos idiomas Português (Brasil) e Inglês.
* ⚙️ Configuração da velocidade da fala.
* ♿ Interface desenvolvida com foco em acessibilidade.
* ⌨️ Atalhos de teclado para ativação rápida do assistente.
* 👁️ Exibição opcional da câmera com marcação visual dos objetos detectados.

---

## 🛠 Tecnologias Utilizadas

### Front-end

* HTML5
* CSS3
* JavaScript
* TensorFlow.js
* COCO-SSD
* Web Speech API
* Web Audio API

### Back-end

* Python
* Flask
* Pillow (PIL)

---

## 🏗 Arquitetura

```text
                ┌─────────────────────┐
                │     Navegador       │
                └──────────┬──────────┘
                           │
                    Captura da câmera
                           │
                           ▼
                  TensorFlow.js + COCO-SSD
                           │
                 Detecção de Objetos
                           │
                           ▼
             Conversão em orientação espacial
                           │
                           ▼
        SpeechSynthesis (Feedback em áudio)
                           │
                           ▼
                      Usuário
```

O servidor Flask atua como servidor da aplicação e foi estruturado para permitir futuras integrações com modelos de Inteligência Artificial executados em nuvem.

---

## 📂 Estrutura do Projeto

```text
project/
│
├── app.py
│
├── templates/
│   └── index.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── local-ai.js
│
└── README.md
```

---

## ⚙️ Como Executar

### 1. Clone o repositório

```bash
git clone https://github.com/Victor-HCSilva/visao-computacional-projeto-final.git

cd visao-computacional-projeto-final
```

---

### 2. Crie um ambiente virtual (opcional)

Linux/macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

Windows

```powershell
python -m venv venv

venv\Scripts\activate
```

---

### 3. Instale as dependências

```bash
pip install -r requiremets.txt
```

---

### 4. Execute a aplicação

```bash
python app.py
```

---

### 5. Acesse no navegador

No computador:

```text
https://localhost:5000
```

ou pelo celular conectado à mesma rede:

```text
https://IP_DA_MÁQUINA:5000
```

O próprio servidor informa o endereço IP disponível ao iniciar a aplicação.

---

## 🧠 Funcionamento

1. O usuário ativa o assistente.
2. A câmera é iniciada.
3. O modelo COCO-SSD é carregado.
4. Quadros do vídeo são capturados continuamente.
5. Os objetos são identificados.
6. O sistema estima sua posição (esquerda, centro ou direita).
7. As informações são convertidas em frases curtas.
8. A resposta é reproduzida por voz.

Exemplos:

> Pessoa à frente.

> Cadeira à esquerda.

> Mesa à direita.

> Caminho livre.

---

## ♿ Recursos de Acessibilidade

* Interface com botões grandes.
* Alto contraste.
* Compatibilidade com teclado.
* Sons indicativos de estado.
* Leitura automática dos menus.
* Controle da velocidade da fala.
* Suporte bilíngue.
* Feedback sonoro contínuo.

---

## 🔮 Trabalhos Futuros

O projeto foi desenvolvido priorizando o processamento local das imagens.

Como evolução futura, pretende-se integrar modelos generativos de Inteligência Artificial, como o **Google Gemini**, permitindo:

* descrição completa do ambiente;
* reconhecimento do contexto da cena;
* identificação de riscos domésticos;
* orientação mais natural durante a navegação;
* interpretação de objetos que não pertencem ao conjunto de classes do COCO-SSD.

Essa integração utilizará o backend Flask já preparado para receber imagens capturadas pelo navegador e encaminhá-las para análise em um serviço de IA em nuvem.

---

## 📊 Resultados Esperados

* Detecção rápida de objetos.
* Baixa latência.
* Funcionamento offline no modo local.
* Preservação da privacidade.
* Maior autonomia para pessoas com deficiência visual.

---

## 📄 Licença

Este projeto possui finalidade acadêmica e educacional.
