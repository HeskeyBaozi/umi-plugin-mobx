import { isPlural, plural, singular } from 'pluralize';
import { Excludes } from '../api';

export function transformWord(word: string, toSingular: boolean) {
  if (isPlural(word)) {
    return toSingular ? singular(word) : word;
  } else {
    return toSingular ? word : plural(word);
  }
}

export function optsToArray(item: any): Excludes {
  if (!item) { return []; }
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}

export function normalizePath(path: string, stripTrailing?: boolean) {
  if (typeof path !== 'string') {
    throw new TypeError('expected path to be a string');
  }

  if (path === '\\' || path === '/') { return '/'; }

  const len = path.length;
  if (len <= 1) { return path; }

  // ensure that win32 namespaces has two leading slashes, so that the path is
  // handled properly by the win32 version of path.parse() after being normalized
  // https://msdn.microsoft.com/library/windows/desktop/aa365247(v=vs.85).aspx#namespaces
  let prefix = '';
  if (len > 4 && path[3] === '\\') {
    const ch = path[2];
    if ((ch === '?' || ch === '.') && path.slice(0, 2) === '\\\\') {
      path = path.slice(2);
      prefix = '//';
    }
  }

  const segs = path.split(/[/\\]+/);
  if (stripTrailing !== false && segs[segs.length - 1] === '') {
    segs.pop();
  }
  return prefix + segs.join('/');
}

export function endWithSlash(path: string) {
  return path.slice(-1) !== '/' ? `${path}/` : path;
}

export function getName(path: string) {
  return (path.split('/').pop() || '').replace(/\..+$/, '');
}

export function chunkName(cwd: string, path: string) {
  return stripFirstSlash(normalizePath(path).replace(normalizePath(cwd), '')).replace(
    /\//g,
    '__'
  );
}
function stripFirstSlash(path: string) {
  if (path.charAt(0) === '/') {
    return path.slice(1);
  } else {
    return path;
  }
}

export function useExclude(models: string[], excludes: Excludes) {
  return models.filter((model) => {
    for (const exclude of excludes) {
      if (typeof exclude === 'function' && exclude(getName(model))) {
        return false;
      }
      if (exclude instanceof RegExp && exclude.test(getName(model))) {
        return false;
      }
    }
    return true;
  });
}
