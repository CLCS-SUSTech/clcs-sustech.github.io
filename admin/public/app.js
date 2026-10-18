/* global fetch, confirm, alert, FormData */

const state = {
  course: null,
  courses: [],
  years: [],
  terms: {},        // year -> term data (editable copy)
  activeYear: null,
  dirtyYears: new Set(),
  git: { branch: '', dirty: [] },
};

// ---------- utilities ----------

const $ = (selector) => document.querySelector(selector);

async function api(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error ?? `请求失败（${response.status}）`);
    error.status = response.status;
    error.hint = data.hint;
    throw error;
  }
  return data;
}

let toastTimer = null;
function toast(message, isError = false) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.toggle('toast--error', isError);
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const fileName = (path) => path.split('/').pop();
const fileStem = (path) => fileName(path).replace(/\.[^.]+$/, '');

const KIND_LABEL = { slide: '讲义', reading: '阅读', note: '笔记' };

// ---------- data ----------

async function loadState() {
  const data = await api('/api/state');
  state.courses = data.courses;
  state.git = data.git;
  if (!state.course || !state.courses.some((c) => c.course === state.course)) {
    state.course = state.courses[0]?.course ?? null;
  }
}

async function loadCourse() {
  if (!state.course) return;
  const data = await api(`/api/course/${state.course}`);
  state.years = data.years;
  state.terms = data.terms;
  if (!state.years.includes(state.activeYear)) state.activeYear = state.years[0] ?? null;
  state.dirtyYears.clear();
}

function markDirty() {
  state.dirtyYears.add(state.activeYear);
  renderSaveBar();
}

function updateGitBadge() {
  const badge = $('#git-badge');
  const count = state.git.dirty.length;
  badge.textContent = count
    ? `${state.git.branch || 'git'} · ${count} 个未发布更改`
    : `${state.git.branch || 'git'} · 已同步`;
  badge.classList.toggle('git-badge--dirty', count > 0);
  badge.title = count ? state.git.dirty.join('\n') : '课程内容与课程文件均无未发布更改';
}

// ---------- rendering ----------

function renderTabs() {
  const tabs = $('#year-tabs');
  tabs.replaceChildren();
  for (const year of state.years) {
    const btn = el('button', 'year-tab', `${year} 学期`);
    btn.classList.toggle('year-tab--active', year === state.activeYear);
    if (state.dirtyYears.has(year)) btn.append(el('span', 'dot', '●'));
    btn.addEventListener('click', () => {
      state.activeYear = year;
      renderAll();
    });
    tabs.append(btn);
  }
}

function field(labelText, value, onInput) {
  const label = el('label', 'field');
  label.append(el('span', 'field-label', labelText));
  const input = el('input', 'field-input');
  input.type = 'text';
  input.value = value ?? '';
  input.addEventListener('input', () => onInput(input.value));
  label.append(input);
  return label;
}

function uploadButton(week, kind) {
  const label = { slides: '＋ 上传讲义', readings: '＋ 上传阅读', labs: '＋ 上传实验' }[kind];
  const btn = el('button', 'btn btn-upload', label);
  const picker = document.createElement('input');
  picker.type = 'file';
  picker.hidden = true;
  btn.append(picker);

  const handle = (file) => { if (file) uploadAndAttach(week, kind, file); };
  btn.addEventListener('click', () => picker.click());
  picker.addEventListener('change', () => { handle(picker.files[0]); picker.value = ''; });
  btn.addEventListener('dragover', (event) => { event.preventDefault(); btn.classList.add('btn-upload--over'); });
  btn.addEventListener('dragleave', () => btn.classList.remove('btn-upload--over'));
  btn.addEventListener('drop', (event) => {
    event.preventDefault();
    btn.classList.remove('btn-upload--over');
    handle(event.dataTransfer.files[0]);
  });
  return btn;
}

function resourceChip(week, resource) {
  const chip = el('span', 'chip');
  chip.append(
    el('span', 'chip-kind', KIND_LABEL[resource.kind] ?? resource.kind),
    el('span', 'chip-name', fileName(resource.path)),
  );
  const remove = el('button', 'chip-remove', '×');
  remove.title = '移除链接（不删除文件）';
  remove.addEventListener('click', (event) => {
    event.stopPropagation();
    week.resources = week.resources.filter((item) => item !== resource);
    if (!week.resources.length) delete week.resources;
    markDirty();
    renderMain();
  });
  chip.append(remove);
  chip.addEventListener('click', () => openResourceDialog(week, resource));
  return chip;
}

function labChip(week, path) {
  const chip = el('span', 'chip chip--lab');
  chip.append(el('span', 'chip-name', fileName(path)));
  const remove = el('button', 'chip-remove', '×');
  remove.title = '移除链接（不删除文件）';
  remove.addEventListener('click', () => {
    const labs = week.labPaths ?? (week.labPath ? [week.labPath] : []);
    const next = labs.filter((item) => item !== path);
    delete week.labPath;
    if (next.length) week.labPaths = next;
    else delete week.labPaths;
    markDirty();
    renderMain();
  });
  chip.append(remove);
  return chip;
}

function weekCard(week) {
  const card = el('section', 'week-card');

  const head = el('div', 'week-head');
  const weekInput = el('input', 'week-number');
  weekInput.type = 'number';
  weekInput.min = '1';
  weekInput.value = String(week.week);
  weekInput.addEventListener('change', () => {
    const value = Number.parseInt(weekInput.value, 10);
    if (Number.isInteger(value) && value > 0) { week.week = value; markDirty(); }
    else weekInput.value = String(week.week);
  });
  head.append(el('span', 'week-prefix', 'W'), weekInput);

  const removeWeek = el('button', 'btn btn-ghost', '删除本周');
  removeWeek.addEventListener('click', () => {
    if (!confirm(`确定删除第 ${week.week} 周？（仅移除页面条目，不影响文件）`)) return;
    const term = state.terms[state.activeYear];
    term.weeks = term.weeks.filter((item) => item !== week);
    markDirty();
    renderMain();
  });
  head.append(el('span', 'spacer'), removeWeek);
  card.append(head);

  const grid = el('div', 'field-grid');
  grid.append(
    field('主题（中）', week.topic?.zh, (v) => { week.topic.zh = v; markDirty(); }),
    field('主题（英）', week.topic?.en, (v) => { week.topic.en = v; markDirty(); }),
    field('日期（中）', week.dates?.zh, (v) => { week.dates ??= { zh: '', en: '' }; week.dates.zh = v; markDirty(); }),
    field('日期（英）', week.dates?.en, (v) => { week.dates ??= { zh: '', en: '' }; week.dates.en = v; markDirty(); }),
    field('备注（中）', week.note?.zh, (v) => { week.note ??= { zh: '', en: '' }; week.note.zh = v; markDirty(); }),
    field('备注（英）', week.note?.en, (v) => { week.note ??= { zh: '', en: '' }; week.note.en = v; markDirty(); }),
  );
  card.append(grid);

  const resourceRow = el('div', 'chip-row');
  resourceRow.append(el('span', 'chip-row-label', '讲义 / 阅读'));
  for (const resource of week.resources ?? []) resourceRow.append(resourceChip(week, resource));
  resourceRow.append(uploadButton(week, 'slides'), uploadButton(week, 'readings'));
  card.append(resourceRow);

  const labRow = el('div', 'chip-row');
  labRow.append(el('span', 'chip-row-label', '实验文件'));
  const labs = week.labPaths ?? (week.labPath ? [week.labPath] : []);
  for (const path of labs) labRow.append(labChip(week, path));
  labRow.append(uploadButton(week, 'labs'));
  card.append(labRow);

  return card;
}

function readingPoolSection(term) {
  const section = el('section', 'pool');
  const head = el('div', 'pool-head');
  head.append(el('h2', null, `阅读材料库（${term.readingPool.length} 份）`));
  const upload = el('button', 'btn btn-upload', '＋ 上传阅读材料');
  const picker = document.createElement('input');
  picker.type = 'file';
  picker.accept = '.pdf';
  picker.hidden = true;
  upload.append(picker);
  const handle = async (file) => {
    if (!file) return;
    try {
      const { path, uploadedAt } = await uploadFile('readings', file);
      term.updatedAt ??= {};
      term.updatedAt[path] = uploadedAt;
      if (!term.readingPool.includes(file.name)) term.readingPool.push(file.name);
      markDirty();
      renderMain();
      toast(`已上传并加入阅读库：${file.name}`);
    } catch (error) { toast(error.message, true); }
  };
  upload.addEventListener('click', () => picker.click());
  picker.addEventListener('change', () => { handle(picker.files[0]); picker.value = ''; });
  head.append(upload);
  section.append(head);

  const list = el('ul', 'pool-list');
  for (const name of term.readingPool) {
    const item = el('li', null, name);
    const remove = el('button', 'chip-remove', '×');
    remove.title = '从阅读库移除（不删除文件）';
    remove.addEventListener('click', () => {
      term.readingPool = term.readingPool.filter((entry) => entry !== name);
      if (!term.readingPool.length) delete term.readingPool;
      markDirty();
      renderMain();
    });
    item.append(remove);
    list.append(item);
  }
  section.append(list);
  return section;
}

function renderMain() {
  const main = $('#main');
  main.replaceChildren();
  const term = state.terms[state.activeYear];
  if (!term) {
    main.append(el('p', 'empty', '没有可用的学期数据。'));
    return;
  }
  const weeks = [...term.weeks].sort((a, b) => a.week - b.week);
  for (const week of weeks) main.append(weekCard(week));

  const addWeek = el('button', 'btn btn-add-week', '＋ 新增周次');
  addWeek.addEventListener('click', () => {
    const next = Math.max(0, ...term.weeks.map((w) => w.week)) + 1;
    term.weeks.push({ week: next, topic: { zh: '', en: '' } });
    markDirty();
    renderMain();
  });
  main.append(addWeek);

  if (term.readingPool) main.append(readingPoolSection(term));
  renderSaveBar();
}

function renderSaveBar() {
  const bar = $('#save-bar');
  const dirty = state.dirtyYears.has(state.activeYear);
  bar.hidden = !dirty;
  if (dirty) $('#save-hint').textContent = `${state.activeYear} 学期有未保存的修改`;
  $('#save-btn').textContent = `保存 ${state.activeYear} 学期`;
}

function renderAll() {
  $('#course-select').replaceChildren(...state.courses.map(({ course }) => {
    const option = el('option', null, course.toUpperCase());
    option.value = course;
    option.selected = course === state.course;
    return option;
  }));
  updateGitBadge();
  renderTabs();
  renderMain();
}

// ---------- upload ----------

async function uploadFile(kind, file) {
  const params = new URLSearchParams({
    course: state.course, year: state.activeYear, kind, name: file.name,
  });
  let response = await fetch(`/api/upload?${params}`, { method: 'POST', body: file });
  if (response.status === 409) {
    if (!confirm(`文件已存在：${file.name}\n确定覆盖旧版本？`)) throw new Error('已取消上传');
    params.set('force', '1');
    response = await fetch(`/api/upload?${params}`, { method: 'POST', body: file });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? '上传失败');
  return data;
}

async function uploadAndAttach(week, kind, file) {
  try {
    const { path, uploadedAt } = await uploadFile(kind, file);
    const term = state.terms[state.activeYear];
    term.updatedAt ??= {};
    term.updatedAt[path] = uploadedAt;
    if (kind === 'labs') {
      const labs = week.labPaths ?? (week.labPath ? [week.labPath] : []);
      delete week.labPath;
      if (!labs.includes(path)) labs.push(path);
      week.labPaths = labs;
    } else {
      week.resources ??= [];
      if (!week.resources.some((r) => r.path === path)) {
        week.resources.push(kind === 'slides'
          ? { label: { zh: '讲义 PDF', en: 'Slides PDF' }, path, kind: 'slide' }
          : { label: { zh: fileStem(path), en: fileStem(path) }, path, kind: 'reading' });
      }
    }
    markDirty();
    renderMain();
    toast(`已上传：${file.name}（记得保存）`);
  } catch (error) {
    if (error.message !== '已取消上传') toast(error.message, true);
  }
}

// ---------- dialogs ----------

let dialogContext = null;

function openResourceDialog(week, resource) {
  dialogContext = { week, resource };
  $('#res-kind').value = resource.kind;
  $('#res-label-zh').value = resource.label?.zh ?? '';
  $('#res-label-en').value = resource.label?.en ?? '';
  $('#res-show-kind').checked = resource.showKindLabel !== false;
  $('#res-path').textContent = resource.path;
  $('#resource-dialog').showModal();
}

function bindDialogs() {
  $('#res-save').addEventListener('click', () => {
    const { resource } = dialogContext;
    resource.kind = $('#res-kind').value;
    resource.label = { zh: $('#res-label-zh').value, en: $('#res-label-en').value };
    resource.showKindLabel = $('#res-show-kind').checked;
    markDirty();
    renderMain();
    $('#resource-dialog').close();
  });
  $('#res-remove').addEventListener('click', () => {
    const { week, resource } = dialogContext;
    week.resources = week.resources.filter((item) => item !== resource);
    if (!week.resources.length) delete week.resources;
    markDirty();
    renderMain();
    $('#resource-dialog').close();
  });

  $('#publish-run').addEventListener('click', async () => {
    const button = $('#publish-run');
    const log = $('#publish-log');
    button.disabled = true;
    log.hidden = false;
    log.textContent = '正在提交并推送…';
    try {
      const result = await api('/api/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: $('#publish-message').value }),
      });
      state.git = result.git;
      updateGitBadge();
      log.textContent = `✓ 发布成功\n\n${result.log}`;
    } catch (error) {
      const hint = error.hint ? `\n\n${error.hint}` : '';
      log.textContent = `✗ 发布失败\n\n${error.message}${hint}`;
    } finally {
      button.disabled = false;
    }
  });
}

// ---------- save ----------

async function saveActiveYear() {
  const year = state.activeYear;
  const term = state.terms[year];
  term.weeks.sort((a, b) => a.week - b.week);
  try {
    const result = await api(`/api/course/${state.course}/${year}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(term),
    });
    state.git = result.git;
    state.dirtyYears.delete(year);
    updateGitBadge();
    renderTabs();
    renderSaveBar();
    toast(`已保存 ${year} 学期`);
  } catch (error) {
    toast(`保存失败：${error.message}`, true);
  }
}

// ---------- bootstrap ----------

async function boot() {
  $('#refresh-btn').addEventListener('click', async () => {
    await loadState();
    await loadCourse();
    renderAll();
    toast('已刷新');
  });
  $('#course-select').addEventListener('change', async (event) => {
    state.course = event.target.value;
    state.activeYear = null;
    await loadCourse();
    renderAll();
  });
  $('#save-btn').addEventListener('click', saveActiveYear);
  $('#publish-btn').addEventListener('click', () => {
    $('#publish-log').hidden = true;
    $('#publish-dialog').showModal();
  });
  window.addEventListener('beforeunload', (event) => {
    if (state.dirtyYears.size) event.preventDefault();
  });
  bindDialogs();

  await loadState();
  await loadCourse();
  renderAll();
}

boot().catch((error) => alert(`面板初始化失败：${error.message}`));
