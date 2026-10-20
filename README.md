# Portfólio · Dominique Curuantaue

Site estático em português, responsivo. Abra `index.html` no navegador para visualizar. A geração dos projetos usa Node.js, sem dependências externas.

## Projetos ligados à aprendizagem

A organização segue estudo → capítulo → projeto. Os dados estão em `data/learning.json`; execute `node scripts/build-learning.cjs` para atualizar a página e `node scripts/build-learning.cjs --check` para validar. Consulte [LEARNING.md](LEARNING.md) para acrescentar estudos, capítulos e projetos.

## Estrutura

- `index.html`: página principal, apresentação e ligações para o GitHub.
- `assets/css/style.css`: estilos e adaptação para telemóveis.
- `assets/js/main.js`: ano do rodapé, navegação e animação da apresentação.
- `data/learning.json`: estudos, capítulos e projetos.
- `scripts/build-learning.cjs`: validação e geração da secção Projetos.
- `assets/favicon.svg`: ícone do site.
- `portfolio-details.html`, `service-details.html`, `starter-page.html` e `Readme.txt`: originais do template DevFolio, preservados como referência. Dependem de recursos que não vieram nesta pasta; não fazem parte da nova publicação.

## Personalização pendente

Confirmar área profissional, biografia, contactos públicos e projetos antes de acrescentar esses dados. A página não apresenta projetos privados nem competências não confirmadas. O nome e o endereço do GitHub foram obtidos do perfil ligado.

## Publicar gratuitamente no GitHub Pages

1. Autentique o GitHub CLI: `gh auth login --hostname github.com --web`.
2. Execute `./publish.ps1` no PowerShell nesta pasta.

O script gera a organização dos projetos, envia os ficheiros em base64 para `DominiqueCuruantaue/profissional_profile`, cria commits e configura Pages a partir da raiz de `main`. Verifique a conclusão da publicação e os bytes dos ficheiros públicos contra os locais.

Endereço previsto, após a publicação: https://dominiquecuruantaue.github.io/profissional_profile/

Documentação: https://docs.github.com/en/pages/quickstart
