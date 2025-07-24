# lemit-telefone-crawler

Este projeto automatiza a busca de **telefones de beneficiários de precatórios** utilizando **Selenium WebDriver** para navegação no site [Lemit](https://lemitti.com). O script realiza o login, pesquisa os CPFs com base nos nomes e prefixos fornecidos, e salva os dados encontrados (telefone fixo e celular) no banco de dados.

## Funcionalidades

- Login automatizado no site Lemit
- Busca de CPFs com base no nome parcial
- Validação de prefixos para evitar ambiguidades
- Clique automatizado para acessar os dados
- Extração de telefones fixos e celulares
- Gravação em banco de dados MySQL
- Marcação automática se os dados foram encontrados ou inconclusivos

## Tecnologias Utilizadas

- Node.js
- Selenium WebDriver
- MySQL2 (via pool de conexões)
