const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const slug = /^[a-z][a-z0-9-]*$/;
function validate(data) {
  if (!Array.isArray(data.studies) || !Array.isArray(data.projects)) throw Error('studies and projects must be arrays');
  const ids = new Set();
  const addId = id => { if (!slug.test(id) || ids.has(id)) throw Error(`Invalid or duplicate ID: ${id}`); ids.add(id); };
  const required = (item, fields) => { for (const field of fields) if (typeof item[field] !== 'string' || !item[field].trim()) throw Error(`Missing ${field}: ${item.id}`); };
  for (const study of data.studies) {
    addId(study.id);
    required(study, ['title','provider','formationId','status','description']);
    if (!slug.test(study.formationId) || !Array.isArray(study.chapters)) throw Error(`Invalid study: ${study.id}`);
    const chapterIds = new Set();
    for (const chapter of study.chapters) {
      required(chapter,['id','title']);
      if (!slug.test(chapter.id) || chapterIds.has(chapter.id)) throw Error(`Invalid chapter: ${chapter.id}`);
      chapterIds.add(chapter.id);
    }
  }
  for (const project of data.projects) {
    addId(project.id);
    required(project,['studyId','title','description','learning']);
    const study = data.studies.find(study => study.id === project.studyId);
    if (!study) throw Error(`Unknown study: ${project.studyId}`);
    if (project.chapterId != null && !study.chapters.some(chapter => chapter.id === project.chapterId)) throw Error(`Unknown chapter: ${project.chapterId}`);
    if (!['project','material'].includes(project.type) || !Array.isArray(project.skills) || !project.skills.every(skill=>typeof skill === 'string') || !Array.isArray(project.links)) throw Error(`Invalid project: ${project.id}`);
    for (const link of project.links) {
      required(link,['label','url']);
      if (!/^https:\/\//.test(link.url) && !/^assets\/[a-zA-Z0-9_./-]+$/.test(link.url)) throw Error(`Unsafe link: ${link.url}`);
      if (link.url.startsWith('assets/') && (link.url.includes('..') || !fs.existsSync(path.join(root,link.url)))) throw Error(`Missing local file: ${link.url}`);
    }
  }
}
function render(data) {
  validate(data);
  const projectCard = (project, study) => `<article class="learning-project" id="${project.id}">
    <p class="eyebrow">${project.type === 'material' ? 'MATERIAL DE APRENDIZAGEM' : 'PROJETO'}</p>
    <h4>${escape(project.title)}</h4><p>${escape(project.description)}</p>
    <p><strong>Aprendizagem:</strong> ${escape(project.learning)}</p>
    ${project.skills.length ? `<ul class="learning-skills" aria-label="Temas e ferramentas">${project.skills.map(skill=>`<li>${escape(skill)}</li>`).join('')}</ul>` : ''}
    <div class="learning-links">${project.links.map(link=>`<a class="text-link" href="${escape(link.url)}"${link.download ? ' download' : link.url.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escape(link.label)} <span aria-hidden="true">${link.download ? '↓' : '↗'}</span></a>`).join('')}</div>
    <a class="learning-origin" href="#${study.formationId}">Estudo de origem: ${escape(study.title)} ↑</a>
  </article>`;
  return `<nav class="study-nav" aria-label="Projetos por estudo">${data.studies.map(study=>`<a href="#projetos-${study.id}">${escape(study.title)}</a>`).join('')}</nav>\n` + data.studies.map(study=>{
    const projects = data.projects.filter(project=>project.studyId===study.id);
    const count = projects.filter(project=>project.type==='project').length;
    const chapters = study.chapters.map(chapter=>{
      const items = projects.filter(project=>project.chapterId===chapter.id);
      return `<section class="learning-chapter" aria-labelledby="capitulo-${study.id}-${chapter.id}"><h4 id="capitulo-${study.id}-${chapter.id}">${escape(chapter.title)}</h4>${chapter.description ? `<p>${escape(chapter.description)}</p>` : ''}${items.length ? items.map(project=>projectCard(project,study)).join('\n') : '<p class="learning-empty">Ainda não há projetos publicados neste capítulo.</p>'}</section>`;
    }).join('\n');
    const general = projects.filter(project=>project.chapterId==null);
    return `<section class="study-group" id="projetos-${study.id}" aria-labelledby="estudo-${study.id}">
      <div class="study-heading"><div><p class="eyebrow">${escape(study.provider)}</p><h3 id="estudo-${study.id}">${escape(study.title)}</h3></div><span class="tag">${escape(study.status)}</span></div>
      <p class="study-description">${escape(study.description)}</p>
      <p class="experience-meta">${count} ${count===1 ? 'projeto publicado' : 'projetos publicados'}${projects.some(project=>project.type==='material') ? ' · Material de aprendizagem disponível' : ''}</p>
      <a class="text-link" href="#${study.formationId}">Ver formação e experiência <span aria-hidden="true">↑</span></a>
      ${!projects.length && !study.chapters.length ? '<p class="learning-empty">Ainda não há projetos publicados. Os trabalhos serão acrescentados por capítulo, à medida que a aprendizagem avançar.</p>' : ''}
      ${chapters}${general.length ? `<div class="learning-projects">${general.map(project=>projectCard(project,study)).join('\n')}</div>` : ''}
    </section>`;
  }).join('\n');
}
function build() {
  const data = JSON.parse(fs.readFileSync(path.join(root,'data/learning.json'),'utf8'));
  const file = path.join(root,'index.html');
  let html = fs.readFileSync(file,'utf8');
  const marker = /<!-- LEARNING:START -->[\s\S]*?<!-- LEARNING:END -->/;
  if (!marker.test(html)) throw Error('Learning markers missing from index.html');
  html = html.replace(marker,`<!-- LEARNING:START -->\n${render(data)}\n<!-- LEARNING:END -->`);
  for (const study of data.studies) {
    if (!html.includes(`id="${study.formationId}"`)) throw Error(`Missing formation: ${study.formationId}`);
    const placeholder = new RegExp(`(<p data-study-link="${study.id}">)[\\s\\S]*?(</p>)`);
    if (!placeholder.test(html)) throw Error(`Missing formation link: ${study.id}`);
    html = html.replace(placeholder,`$1<a class="text-link" href="#projetos-${study.id}">Projetos e aprendizagem deste estudo <span aria-hidden="true">↓</span></a>$2`);
  }
  if (process.argv.includes('--check')) {
    if (html !== fs.readFileSync(file,'utf8')) throw Error('Generated content is outdated. Run node scripts/build-learning.cjs');
  } else fs.writeFileSync(file,html,'utf8');
  console.log(`${data.studies.length} studies and ${data.projects.length} linked items validated`);
}
if (require.main===module) build();
module.exports = {validate,render};
