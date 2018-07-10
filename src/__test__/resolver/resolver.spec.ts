import * as assert from 'assert';
import { resolve } from 'path';
import { normalizePath } from '../../utils/helpers';
import UmiResolver from '../../utils/resolver';

function normalizeModels(base: string) {
  return function normalize(models: string[]) {
    return models.map((model) => model.replace(base, '$CWD$'));
  };
}

describe('UmiResolver', () => {
  const base = normalizePath(resolve(__dirname, './cases'));
  const resolver = new UmiResolver('store');

  it('can get model.', () => {
    const dir = normalizePath(resolve(base, './store'));
    const normalize = normalizeModels(dir);
    const models = normalize(resolver.getModelPaths(dir, false));
    assert.deepEqual(models, [
      '$CWD$/store.js'
    ]);
  });

  it('can get models from models dirctory.', () => {
    const dir = normalizePath(resolve(base, './stores'));
    const normalize = normalizeModels(dir);
    const models = normalize(resolver.getModelPaths(dir, false));
    assert.deepEqual(models, [
      '$CWD$/stores/user.js',
      '$CWD$/stores/user.jsx',
      '$CWD$/stores/user.ts',
      '$CWD$/stores/user.tsx'
    ]);
  });

  it('should pass simple tests.', () => {
    const srcPath = normalizePath(resolve(base, './simple'));
    const normalize = normalizeModels(srcPath);
    const models = normalize(resolver.getPageModelPaths({
      cwd: resolve(srcPath, './pages/problems/detail/index.tsx'),
      absPagesPath: resolve(srcPath, './pages'),
      absSrcPath: srcPath,
      singular: false
    }));

    assert.deepEqual(models, [
      '$CWD$/pages/problems/detail/stores/problem-detail.ts',
      '$CWD$/pages/problems/stores/problems.ts'
    ]);

    const models2 = normalize(resolver.getGlobalModelPaths({
      absSrcPath: srcPath,
      absPagesPath: resolve(srcPath, './pages'),
      config: { singular: false }
    }));

    assert.deepEqual(models2, [
      '$CWD$/stores/global.ts',
      '$CWD$/pages/stores/global-inner-pages.ts'
    ]);
  });
});
