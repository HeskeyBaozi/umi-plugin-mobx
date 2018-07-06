import { sync } from 'globby';
import { transformWord, normalizePath, endWithSlash } from './helpers';
import { join, dirname } from 'path';
const uniq = require('lodash.uniq');


/**
 * Use the rule which is same with umi-plugin-dva.
 * Reference: https://github.com/umijs/umi/blob/master/packages/umi-plugin-dva/src/index.js
 */
export default class UmiResolver {

  targetName: string;

  constructor(targetName: string) {
    this.targetName = targetName;
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
}


