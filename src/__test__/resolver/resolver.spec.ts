import * as assert from 'assert';
import { join, resolve } from 'path';
import UmiResolver from '../../utils/resolver';

function normalizeModels(base: string) {
  return function normalize(models: string[]) {
    return models.map(model => model.replace(base, '$CWD$'));
  }
}

describe('UmiResolver', () => {
  const base = resolve(__dirname, './cases');
  const resolver = new UmiResolver('store');

  it('can get model.', () => {
    const dir = resolve(base, './store');
    const normalize = normalizeModels(dir);
    const models = normalize(resolver.getModelPaths(dir, false));
    assert.deepEqual(models, [
      '$CWD$/store.js'
    ]);
  });

  it('can get models from models dirctory.', () => {
    const dir = resolve(base, './stores');
    const normalize = normalizeModels(dir);
    const models = normalize(resolver.getModelPaths(dir, false));
    assert.deepEqual(models, [
      '$CWD$/stores/user.js',
      '$CWD$/stores/user.jsx',
      '$CWD$/stores/user.ts',
      '$CWD$/stores/user.tsx',
    ]);
  })
});
