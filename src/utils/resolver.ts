import { sync } from 'globby';
import { transformWord, normalizePath } from './helpers';
import { join } from 'path';
import { Excludes } from '../api';


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
      return singularModel.map((path) => normalizePath(join(cwd, path)));
    }

    return sync(
      `./${transformWord(this.targetName, singular)}/**/*.{ts,tsx,js,jsx}`,
      { cwd }
    )
      .filter((path) => !/\.(d|test)\.[tj]sx?$/.test(path))
      .map((path) => normalizePath(join(cwd, path)));
  }

  getGlobalModelPaths(
    { absSrcPath, config }: { absSrcPath: string, config: { singular: boolean } }) {
    let globalModelPaths = this.getModelPaths(absSrcPath, config.singular);
    return globalModelPaths;
  }

  static exclude(paths: string[], tests: Excludes) {
    return paths.filter((path) => {
      for (const test of tests) {
        const name = path.split('/').pop() || '';
        if (test instanceof RegExp && test.test(name)) {
          return false;
        } else {
          if (typeof test === 'function' && test(name)) {
            return false;
          }
        }
      }
      return true;
    })
  }
}


