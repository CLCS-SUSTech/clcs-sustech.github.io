// Local admin server for course maintenance: edit term YAML, upload files, publish via git.
// Runs on 127.0.0.1 only — no auth, never expose it to the network.
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import {
  copyFileSync, createWriteStream, existsSync, mkdirSync, readdirSync,
  readFileSync, renameSync, statSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT ?? 4210);
const COURSES_DIR = join(root, 'src/content/courses');
const PUBLIC_DIR = join(root, 'public');
const ADMIN_PUBLIC = join(root, 'admin/public');
const BACKUP_DIR = join(root, 'admin/.backups');
const KINDS = new Set(['slides', 'readings', 'labs']);
const MANAGED_PATHS = ['src/content/courses', 'public/course'];
const MAX_BACKUPS = 20;

// ---------- helpers ----------

const git = (args, timeout = 15_000) => execFileSync('git', args, {
  cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout,
}).trim();

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolvePromise, rejectPromise) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 10 * 1024 * 1024) rejectPromise(new Error('请求体过大'));
      else chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolvePromise(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { rejectPromise(new Error('无效的 JSON')); }
    });
    req.on('error', rejectPromise);
  });
}

function validCourse(course) {
  return /^[a-z0-9-]+$/.test(course) && existsSync(join(COURSES_DIR, course));
}

function validYear(year) {
  return /^\d{4}$/.test(year);
}

function termFile(course, year) {
  return join(COURSES_DIR, course, `${year}.yaml`);
}

function listCourses() {
  return readdirSync(COURSES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function listYears(course) {
  return readdirSync(join(COURSES_DIR, course))
    .filter((file) => /^\d{4}\.yaml$/.test(file))
    .map((file) => file.replace(/\.yaml$/, ''))
    .sort()
    .reverse();
}

// Light structural validation; the authoritative check is the Astro schema at build time.
function validateTerm(data) {
  if (typeof data?.course !== 'string' || !/^\d{4}$/.test(data?.year ?? '')) {
    return '缺少 course 或 year 字段';
  }
  if (!Array.isArray(data.weeks)) return 'weeks 必须是数组';
  for (const [index, week] of data.weeks.entries()) {
    if (!Number.isInteger(week?.week)) return `第 ${index + 1} 个周次缺少 week 编号`;
    if (typeof week?.topic?.zh !== 'string' || typeof week?.topic?.en !== 'string') {
      return `第 ${week?.week ?? index + 1} 周缺少双语 topic`;
    }
    if (week.resources !== undefined && !Array.isArray(week.resources)) return `第 ${week.week} 周 resources 必须是数组`;
    if (week.labPaths !== undefined && !Array.isArray(week.labPaths)) return `第 ${week.week} 周 labPaths 必须是数组`;
  }
  if (data.readingPool !== undefined && !Array.isArray(data.readingPool)) return 'readingPool 必须是数组';
  if (data.updatedAt !== undefined && (typeof data.updatedAt !== 'object' || data.updatedAt === null || Array.isArray(data.updatedAt))) {
    return 'updatedAt 必须是对象';
  }
  return null;
}

function backupTerm(file, course, year) {
  if (!existsSync(file)) return;
  mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  copyFileSync(file, join(BACKUP_DIR, `${course}-${year}-${stamp}.yaml`));
  const backups = readdirSync(BACKUP_DIR)
    .filter((name) => name.startsWith(`${course}-${year}-`))
    .sort();
  while (backups.length > MAX_BACKUPS) {
    const oldest = backups.shift();
    try { unlinkSync(join(BACKUP_DIR, oldest)); } catch { /* ignore */ }
  }
}

function gitState() {
  let branch = '';
  let dirty = [];
  try {
    branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
    dirty = git(['status', '--porcelain=v1', '--', ...MANAGED_PATHS])
      .split('\n').filter(Boolean).map((line) => line.slice(3));
  } catch { /* not a git repo or git unavailable */ }
  return { branch, dirty };
}

// ---------- routes ----------

async function handleApi(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean); // ['api', ...]

  if (req.method === 'GET' && url.pathname === '/api/state') {
    return sendJson(res, 200, {
      courses: listCourses().map((course) => ({ course, years: listYears(course) })),
      git: gitState(),
    });
  }

  // /api/course/:course  — read all terms of one course
  if (req.method === 'GET' && parts.length === 3 && parts[1] === 'course') {
    const course = parts[2];
    if (!validCourse(course)) return sendJson(res, 404, { error: '课程不存在' });
    const terms = {};
    for (const year of listYears(course)) {
      terms[year] = parse(readFileSync(termFile(course, year), 'utf8'));
    }
    return sendJson(res, 200, { course, years: listYears(course), terms });
  }

  // /api/course/:course/:year — write one term
  if (req.method === 'PUT' && parts.length === 4 && parts[1] === 'course') {
    const [, , course, year] = parts;
    if (!validCourse(course) || !validYear(year)) return sendJson(res, 404, { error: '课程或学期不存在' });
    const data = await readJsonBody(req);
    const problem = validateTerm(data);
    if (problem) return sendJson(res, 400, { error: problem });
    const file = termFile(course, year);
    backupTerm(file, course, year);
    writeFileSync(file, stringify(data, { lineWidth: 0 }));
    return sendJson(res, 200, { ok: true, git: gitState() });
  }

  // /api/files?course&year&kind — list files in a material directory
  if (req.method === 'GET' && url.pathname === '/api/files') {
    const { course, year, kind } = Object.fromEntries(url.searchParams);
    if (!validCourse(course ?? '') || !validYear(year ?? '') || !KINDS.has(kind)) {
      return sendJson(res, 400, { error: '参数无效' });
    }
    const dir = join(PUBLIC_DIR, 'course', course, year, kind);
    if (!existsSync(dir)) return sendJson(res, 200, { files: [] });
    const files = readdirSync(dir).map((name) => {
      const stat = statSync(join(dir, name));
      return { name, size: stat.size, mtime: stat.mtime.toISOString() };
    }).sort((a, b) => a.name.localeCompare(b.name));
    return sendJson(res, 200, { files });
  }

  // /api/upload?course&year&kind&name[&force=1] — raw request body is the file
  if (req.method === 'POST' && url.pathname === '/api/upload') {
    const params = Object.fromEntries(url.searchParams);
    const { course, year, kind } = params;
    const name = basename(params.name ?? '');
    if (!validCourse(course ?? '') || !validYear(year ?? '') || !KINDS.has(kind) || !name || name.startsWith('.')) {
      return sendJson(res, 400, { error: '参数无效' });
    }
    const dir = join(PUBLIC_DIR, 'course', course, year, kind);
    const target = join(dir, name);
    if (existsSync(target) && params.force !== '1') {
      return sendJson(res, 409, { error: `文件已存在：${name}` });
    }
    mkdirSync(dir, { recursive: true });
    const temp = join(dir, `.upload-${process.pid}-${Date.now()}`);
    await new Promise((resolvePromise, rejectPromise) => {
      const stream = createWriteStream(temp);
      req.pipe(stream);
      req.on('error', rejectPromise);
      stream.on('error', rejectPromise);
      stream.on('finish', resolvePromise);
    });
    renameSync(temp, target);
    const { size } = statSync(target);
    return sendJson(res, 200, {
      ok: true,
      path: `course/${course}/${year}/${kind}/${name}`,
      size,
      uploadedAt: new Date().toISOString(),
    });
  }

  // /api/publish {message} — git add managed paths, commit, push
  if (req.method === 'POST' && url.pathname === '/api/publish') {
    const { message } = await readJsonBody(req);
    const commitMessage = String(message ?? '').trim() || 'Update course materials';
    let committed = false;
    try {
      const preStaged = git(['diff', '--cached', '--name-only'])
        .split('\n').filter(Boolean)
        .filter((file) => !MANAGED_PATHS.some((managed) => file.startsWith(managed)));
      if (preStaged.length) {
        return sendJson(res, 409, {
          error: `存在面板之外的已暂存更改，请先在终端处理：${preStaged.join(', ')}`,
        });
      }
      git(['add', '--', ...MANAGED_PATHS]);
      const pending = git(['status', '--porcelain=v1', '--', ...MANAGED_PATHS]);
      const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']) || 'main';
      let unpushed = '';
      try { unpushed = git(['log', '--oneline', `origin/${branch}..HEAD`], 10_000); } catch { /* no upstream ref yet */ }

      let commit = '';
      if (pending) {
        commit = git(['commit', '-m', commitMessage]);
        committed = true;
      }
      if (!pending && !unpushed) {
        return sendJson(res, 200, { ok: true, log: '没有需要提交的更改。', git: gitState() });
      }
      // Push gets a long budget: course zips can be tens of MB on slow networks.
      const push = git(['push'], 300_000);
      return sendJson(res, 200, {
        ok: true,
        log: [commit, push].filter(Boolean).join('\n\n'),
        git: gitState(),
      });
    } catch (error) {
      const detail = error?.stderr?.toString().trim() || error?.message || 'git 操作失败';
      let hint = null;
      if (/non-fast-forward|fetch first|\brejected\b/i.test(detail)) {
        hint = '远端有新提交，请先在终端执行 git pull 合并后再发布。';
      } else if (/Permission denied|Authentication failed|access rights/i.test(detail)) {
        hint = 'GitHub 认证失败，请检查 SSH key 与仓库访问权限。';
      } else if (/timed out|timeout|Connection|Could not read from remote|ETIMEDOUT|operation timed out/i.test(detail)) {
        hint = committed
          ? '连接 GitHub 超时。提交已保存在本地仓库，网络恢复后直接重新点击发布即可推送，不会重复提交。'
          : '连接 GitHub 超时，请检查网络后重试。';
      }
      return sendJson(res, 500, { error: detail, hint });
    }
  }

  return sendJson(res, 404, { error: '未知接口' });
}

// ---------- static + bootstrap ----------

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      return await handleApi(req, res, url);
    }
    const name = url.pathname === '/' ? 'index.html' : basename(url.pathname);
    const file = join(ADMIN_PUBLIC, name);
    if (!existsSync(file)) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[name.slice(name.lastIndexOf('.'))] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  } catch (error) {
    sendJson(res, 500, { error: error?.message ?? '服务器错误' });
  }
});

server.listen(port, '127.0.0.1', () => {
  const address = `http://127.0.0.1:${port}/`;
  console.log(`课程管理面板已启动：${address}`);
  console.log('关闭：按 Ctrl+C。此面板仅监听本机回环地址。');
  if (process.platform === 'darwin' && process.env.ADMIN_NO_OPEN !== '1') {
    try { execFileSync('open', [address]); } catch { /* ignore */ }
  }
});
