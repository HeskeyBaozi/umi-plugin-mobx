import { sync } from 'globby';
import { dirname, join } from 'path';
import { endWithSlash, normalizePath, transformWord } from './helpers';
// tslint:disable-next-line:no-var-requires
const uniq = require('lodash.uniq');

/**
 * Use the rule which is same with umi-plugin-dva.
 * Reference: https://github.com/umijs/umi/blob/master/packages/umi-plugin-dva/src/index.js
 */
export default class UmiResolver {

  targetName: string;
  pluralName: string;
  singularName: string;

  constructor(targetName: string) {
    this.targetName = targetName;
    this.pluralName = transformWord(targetName, false);
    this.singularName = transformWord(targetName, true);
  }

  getModelPaths(cwd: string, singular: boolean) {
    const singularModel = sync(
      `./${transformWord(this.targetName, true)}.{ts,tsx,js,jsx}`,
      { cwd }
    );

    // choose model.js, not models folder.
    if (singularModel.length) {
      return uniq(singularModel.map((path) => normalizePath(join(cwd, path))));
    }

    return uniq(sync(
      `./${transformWord(this.targetName, singular)}/**/*.{ts,tsx,js,jsx}`,
      { cwd }
    )
      .filter((path) => !/\.(d|test)\.[tj]sx?$/.test(path))
      .map((path) => normalizePath(join(cwd, path))));
  }

  getGlobalModelPaths(
    { absSrcPath, absPagesPath, config }: { absSrcPath: string, absPagesPath: string, config: { singular: boolean } }) {
    return uniq([...this.getModelPaths(absSrcPath, config.singular),
    ...this.getModelPaths(absPagesPath, config.singular)]);
  }

  getPageModelPaths({
    cwd,
    absPagesPath,
    absSrcPath,
    singular
  }: {
      cwd: string,
      absPagesPath: string,
      absSrcPath: string,
      singular: boolean
    }): string[] {
    let modelPaths: string[] = [];
    cwd = dirname(cwd);
    while (
      !(endWithSlash(normalizePath(cwd)) === endWithSlash(normalizePath(absPagesPath))) &&
      !(endWithSlash(normalizePath(cwd)) === endWithSlash(normalizePath(absSrcPath))) &&
      !(cwd === join(cwd, '../') || join(cwd, '../') === './')
    ) {
      modelPaths = [...modelPaths, ...this.getModelPaths(cwd, singular)];
      cwd = dirname(cwd);
    }
    return uniq(modelPaths);
  }

  getMobxConfig(cwd: string) {
    const mobxs = sync('./mobx.{ts,js,tsx,jsx}', { cwd });
    if (mobxs.length) {
      return normalizePath(mobxs[0]);
    }
  }
}
