# Portfólio — Emerson Guilherme da Silva

Portfólio profissional **responsivo e bilíngue (PT/EN)**, pronto para publicar gratuitamente no GitHub Pages.

## O que está incluído

- `index.html`: página única com apresentação, experiência, competências, projetos e contato.
- `assets/style.css`: visual responsivo e acessível.
- `assets/script.js`: alternância PT/EN e navegação mobile, sem dependências externas.
- `assets/favicon.svg`: ícone vetorial.
- `404.html`: redirecionamento para a página principal.

## Publicação no GitHub Pages

### Opção A — URL pessoal (recomendada)

1. Entre na conta GitHub `EmersonGuilherme`.
2. Crie um repositório **público** chamado exatamente `EmersonGuilherme.github.io`.
3. Envie o conteúdo **desta pasta**, de forma que `index.html` fique na raiz do repositório (não dentro de outra subpasta).
4. Acesse **Settings → Pages** e escolha **Deploy from a branch**.
5. Selecione **main** e **/(root)**, depois salve.
6. Quando a publicação terminar, abra `https://emersonguilherme.github.io/`.

### Opção B — Repositório de projeto

Crie um repositório `portfolio`, envie os arquivos à raiz e configure **Settings → Pages → main → /(root)**. O endereço será `https://emersonguilherme.github.io/portfolio/`.

## Antes de publicar

- Confirme os períodos e os cargos das experiências profissionais no seu currículo atualizado.
- Confira se o LinkedIn e o e-mail são os contatos desejados para publicação.
- Os projetos Guimi Atende e Integra estão identificados como **planejados**.
- O projeto Guimi Test AI está identificado como **em desenvolvimento**, sem afirmação de maturidade de produção.
- Os estudos de caso profissionais são anonimizados e não contêm código confidencial.
- Se quiser adicionar currículo em PDF, salve-o como `assets/cv.pdf` e inclua um botão no `index.html`.

## Personalização rápida

- Textos em português: `index.html`.
- Textos em inglês: objeto `translations` em `assets/script.js`.
- Cores: variáveis `:root` no início de `assets/style.css`.
- Projetos: cartões da seção `id="projetos"` em `index.html`.

## Teste local

Abra `index.html` diretamente no navegador, ou execute:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

Nenhum backend, token, banco de dados ou ferramenta paga é necessário.


## Laboratório interativo (v2)

Quatro demonstrações 100% locais no navegador: validação didática de contrato JSON, distribuição sintética de latência, execução simulada de suíte Cypress/Playwright e avaliação determinística de resposta de chatbot. **Nenhuma delas acessa serviços externos ou executa ferramentas reais.** Os resultados não devem ser divulgados como benchmarks ou testes reais.

Arquivos novos: `assets/demos.js`. O laboratório funciona sem backend, sem build e sem credenciais. Para testar, abra `index.html` ou execute `python -m http.server 8000` na pasta do site.

Para substituir demos por evidências reais no futuro, inclua resultados gerados por repositórios públicos próprios, testes reproduzíveis, prints autorizados e documentação técnica. Não inclua dados internos de clientes.
