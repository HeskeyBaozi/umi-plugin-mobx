import { plural, isPlural, singular } from 'pluralize';

export function transformWord(word: string, toSingular: boolean) {
  if (isPlural(word)) {
    return toSingular ? singular(word) : word;
  } else {
    return toSingular ? word : plural(word);
  }
}

export function normalizePath(path: string, stripTrailing?: boolean) {
  if (typeof path !== 'string') {
    throw new TypeError('expected path to be a string');
  }

  if (path === '\\' || path === '/') return '/';

  let len = path.length;
  if (len <= 1) return path;

  // ensure that win32 namespaces has two leading slashes, so that the path is
  // handled properly by the win32 version of path.parse() after being normalized
  // https://msdn.microsoft.com/library/windows/desktop/aa365247(v=vs.85).aspx#namespaces
  let prefix = '';
  if (len > 4 && path[3] === '\\') {
    var ch = path[2];
    if ((ch === '?' || ch === '.') && path.slice(0, 2) === '\\\\') {
      path = path.slice(2);
      prefix = '//';
    }
  }

  let segs = path.split(/[/\\]+/);
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
    '__',
  );
}
function stripFirstSlash(path: string) {
  if (path.charAt(0) === '/') {
    return path.slice(1);
  } else {
    return path;
  }
}
