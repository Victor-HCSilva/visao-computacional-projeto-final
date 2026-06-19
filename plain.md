# Assistente de Orientação Residencial com IA e Feedback Auditivo

## Resumo

Este projeto propõe o desenvolvimento de um assistente de orientação residencial para pessoas com deficiência visual, utilizando Inteligência Artificial para interpretar imagens capturadas pela câmera do celular e fornecer descrições auditivas do ambiente em tempo real.

A solução deverá operar preferencialmente de forma local, sem necessidade de conexão com a internet, utilizando modelos de IA embarcados no dispositivo móvel. O sistema será capaz de identificar objetos e elementos relevantes do ambiente, gerar descrições curtas e objetivas e convertê-las em áudio, auxiliando na percepção espacial e na locomoção em ambientes internos.

## Objetivo

Desenvolver um aplicativo móvel capaz de:

* Capturar imagens utilizando a câmera do celular;
* Identificar objetos e elementos relevantes do ambiente por meio de Inteligência Artificial;
* Gerar descrições simples sobre a cena observada;
* Converter as descrições em áudio em tempo real;
* Operar localmente, reduzindo a dependência de conexão com a internet.

## Requisitos do Sistema

O projeto deverá atender aos seguintes requisitos:

* Funcionamento em dispositivos móveis;
* Utilização da câmera do celular para captura de imagens;
* Processamento das imagens por Inteligência Artificial;
* Preferência por execução local, permitindo uso sem internet;
* Suporte ao uso de modelos embarcados, como Gemma, ou utilização da API Gemini quando disponível;
* Conversão das descrições geradas em áudio;
* Uso de dispositivos de saída sonora, como alto-falantes ou fones de ouvido.

## Metodologia

O funcionamento do sistema será dividido em quatro etapas principais:

1. Captura contínua de imagens pela câmera do celular;
2. Processamento das imagens por um modelo de Inteligência Artificial capaz de reconhecer objetos e interpretar a cena;
3. Geração de uma descrição resumida do ambiente, destacando os elementos mais relevantes para a orientação do usuário;
4. Conversão da descrição em áudio, fornecendo feedback imediato ao usuário.

Exemplos de respostas produzidas pelo sistema incluem:

* "Porta à frente."
* "Cadeira à esquerda."
* "Pessoa próxima."
* "Mesa à direita."

As mensagens poderão ser geradas em português ou inglês, dependendo das bibliotecas e modelos utilizados.

## Tecnologias Propostas

### Linguagem de Programação

Python será utilizado para o desenvolvimento dos protótipos e integração dos componentes de Inteligência Artificial.

### Plataforma

O sistema poderá ser implementado como aplicativo móvel ou Web App adaptado para dispositivos móveis.

### Inteligência Artificial

Serão utilizados modelos multimodais capazes de interpretar imagens, com prioridade para execução local. Entre as alternativas consideradas estão:

* Gemma embarcado no dispositivo;
* Gemini por meio de API, quando houver disponibilidade de conexão.

### Captura e Processamento de Imagens

A câmera do celular será utilizada para aquisição das imagens, realizando o processamento em tempo real.

### Síntese de Voz

Bibliotecas de Text-to-Speech serão empregadas para converter as descrições produzidas pela IA em mensagens auditivas compreensíveis ao usuário.

## Resultados Esperados

Espera-se desenvolver um sistema capaz de interpretar ambientes residenciais e fornecer orientações auditivas simples e rápidas, contribuindo para a autonomia de pessoas com deficiência visual.

Além do impacto social, o projeto permitirá explorar aplicações práticas de Inteligência Artificial embarcada, visão computacional e interação homem-máquina em dispositivos móveis.

## Conclusão

O Assistente de Orientação Residencial com IA e Feedback Auditivo propõe uma solução acessível e de baixo custo para auxiliar pessoas com deficiência visual na compreensão do ambiente ao seu redor. Ao combinar processamento de imagens, Inteligência Artificial e síntese de voz em um dispositivo móvel, o projeto busca oferecer uma ferramenta prática de acessibilidade, alinhada às tendências atuais de computação embarcada e IA local.
