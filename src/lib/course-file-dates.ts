import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const dates = new Map<string, string | undefined>();

/** Published files use Git history, so a fresh checkout does not reset their dates. */
export function courseFileUpdatedAt(publicPath: string): string | undefined {
  if (dates.has(publicPath)) return dates.get(publicPath);

  const repositoryPath = `public/${publicPath}`;
  const filePath = resolve(process.cwd(), repositoryPath);
  if (!existsSync(filePath)) return undefined;

  let updatedAt: string | undefined;
  try {
    const git = (args: string[]) => execFileSync('git', args, {
      cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    const localChanges = git(['status', '--porcelain=v1', '--untracked-files=all', '--', repositoryPath]);
    // Local previews of new or edited files show their actual filesystem timestamp.
    updatedAt = localChanges
      ? statSync(filePath).mtime.toISOString()
      : git(['log', '-1', '--format=%cI', '--follow', '--', repositoryPath]) || undefined;
  } catch {
    // Do not substitute the build/deployment time if Git history is unavailable.
    console.warn(`File update date unavailable: ${repositoryPath}`);
  }
  dates.set(publicPath, updatedAt);
  return updatedAt;
}

export function formatCourseFileDate(date: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(date));
}
