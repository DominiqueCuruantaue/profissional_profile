# Organizar estudos, capítulos e projetos

`data/learning.json` é a fonte da secção Projetos. A relação é **estudo → capítulo → projeto**. Cada projeto pertence obrigatoriamente a um estudo através de `studyId`; `chapterId` associa-o a um capítulo desse estudo. Projetos de estágio, monografias e materiais sem capítulo usam `chapterId: null`.

O curso de Análise de Dados da Google tem o identificador `google-dados`, com capítulos e projetos ainda vazios. Não são criados títulos de capítulos, resultados, datas ou trabalhos fictícios.

## Acrescentar o trabalho de um capítulo

1. Em `studies`, encontrar o estudo correspondente. Acrescentar a `chapters` o identificador e o título real do capítulo, pela ordem em que deve aparecer:

```json
{"id": "capitulo-1", "title": "Capítulo 1 · Título real", "description": "Resumo do que estudei."}
```

2. Acrescentar a `projects` um registo com os dados reais. Este exemplo é apenas um modelo e não está publicado como projeto:

```json
{
  "id": "google-capitulo-1-projeto",
  "studyId": "google-dados",
  "chapterId": "capitulo-1",
  "type": "project",
  "title": "Título real do projeto",
  "description": "Problema trabalhado e resultado obtido.",
  "learning": "O que aprendi e apliquei neste trabalho.",
  "skills": ["Ferramenta realmente utilizada"],
  "links": []
}
```

3. Em `links`, acrescentar ligações reais com `label` e `url`. São aceites endereços HTTPS e ficheiros existentes em `assets/`. Um ficheiro para descarregar pode incluir `"download": true`. Colocar novos ficheiros na lista `$files` de `publish.ps1` para os enviar também.
4. Executar `node scripts/build-learning.cjs`. O gerador atualiza a secção Projetos, os capítulos, as contagens e as ligações das formações. Não editar à mão o bloco `LEARNING:START` / `LEARNING:END`.
5. Executar `node scripts/build-learning.cjs --check` para confirmar que a página corresponde aos dados.
6. Publicar e verificar os bytes servidos pelo GitHub Pages contra os ficheiros locais.

Podem existir vários projetos no mesmo capítulo. A ordem dos estudos, capítulos e projetos segue os respetivos registos. `type: "material"` identifica material didático e não conta como projeto desenvolvido. Capítulos sem trabalhos mostram um estado vazio explícito.

`node scripts/test-learning.cjs` verifica as relações, as contagens e a rejeição de dados inválidos com exemplos temporários que não são publicados.

## Começar outro estudo

Acrescentar a `studies` um objeto com `id` único, `title`, `provider`, `status`, `description`, `formationId` e `chapters: []`. `formationId` deve ser o `id` de um artigo na secção Experiência e Formação. Dentro desse artigo, acrescentar `<p data-study-link="identificador-do-estudo"></p>`: o gerador cria a ligação para os projetos. Cada projeto também contém uma ligação de regresso à formação de origem.

O gerador rejeita identificadores repetidos, projetos sem estudo, capítulos que não pertencem ao estudo e ficheiros locais em falta. O resultado é HTML estático: a organização continua disponível sem JavaScript e não depende de uma base de dados nem de carregamentos adicionais no navegador.

## Ficheiros

- `data/learning.json`: estudos, capítulos e projetos.
- `scripts/build-learning.cjs`: validação e geração, com Node.js e sem dependências externas.
- `index.html`: resultado gerado entre os marcadores e ligações às formações.
- `assets/css/experience.css`: apresentação dos percursos e projetos.

## Publicação

Autenticar o GitHub CLI com a conta proprietária e executar `./publish.ps1` no PowerShell. O script gera os projetos, envia ficheiros em base64 para `DominiqueCuruantaue/profissional_profile`, cria commits em `main` e configura o GitHub Pages a partir da raiz. Confirmar a conclusão da publicação e comparar os bytes públicos com os locais, conforme `AGENTS.md`.
