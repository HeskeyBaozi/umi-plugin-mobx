import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { AfWebpackOptions, PluginAPI, PluginOptions, ReducerArg } from './api';
import { chunkName, getName, normalizePath, optsToArray, useExclude } from './utils/helpers';
import UmiResolver from './utils/resolver';

export default function umiPluginMobx(api: PluginAPI, options: PluginOptions = {}) {
  const { RENDER, IMPORT } = api.placeholder;
  const { paths, config } = api.service;
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldImportDynamic = isProduction && !config.disableDynamicImport;
  const { modelName = 'store', exclude = [/^\$/] } = options;

  const umiResolver = new UmiResolver(modelName);

  const excluesList = optsToArray(exclude);

  /**
   * Generate temp/MobxProviderEntry.js, temp/withProvider.js
   */
  api.register('generateFiles', ({ memo, args }) => {

    let entryTemplateContent = readFileSync(
      resolve(__dirname, './template/entry.template.js'), { encoding: 'utf8' }
    );

    const identifiers = useExclude(
      umiResolver.getGlobalModelPaths({
        absSrcPath: api.service.paths.absSrcPath,
        absPagesPath: api.service.paths.absPagesPath,
        config: api.service.config
      }),
      excluesList
    )
      .map((path) => ({ name: getName(path), path }))
      .filter((_) => _.name);

    const identifiersContent = identifiers
      .map(({ name, path }) => `const mobx${name} = (require('${path}').default);`.trim())
      .join('\n');

    const restContent = identifiers
      .map(({ name }) =>
        `[ getType(mobx${name}).name === 'AnonymousModel' ? '${name}' : getType(mobx${name}).name ]: mobx${name},`)
      .join('\n');

    const summary = `const mobxStores = { ${restContent} };`.trim();

    const mobxConfig = umiResolver.getMobxConfig(paths.absSrcPath);
    if (mobxConfig) {
      entryTemplateContent = entryTemplateContent
        .replace(
          '/*<% MOBX_CONFIG %>*/',
          `((require('${normalizePath(resolve(paths.absSrcPath, mobxConfig))}').config || (() => ({})))())`
        );
    }

    entryTemplateContent = entryTemplateContent
      .replace('/*<% MOBX_CONFIG %>*/', `{}`)
      .replace('/*<% MOBX_STORES %>*/', `${identifiersContent}\n${summary}`.trim())
      .replace('/*<% GLOBAL_MODELS %>*/', '{ ...mobxStores },');

    writeFileSync(
      join(paths.absTmpDirPath, './MobxProviderEntry.js'),
      entryTemplateContent,
      'utf8'
    );

    // copy withProvider.js
    writeFileSync(
      join(paths.absTmpDirPath, './withProvider.js'),
      readFileSync(resolve(__dirname, './withProvider.js'), { encoding: 'utf8' }),
      'utf8'
    );

    return memo;
  });

  /**
   * Modify temp/umi.js -> render()
   */
  api.register('modifyEntryFile', ({ memo }: ReducerArg<string, undefined>) => {
    const ProviderIdentifier = 'MobxProvider';
    const EntryTemplateName = 'MobxProviderEntry';
    return memo
      .replace(RENDER, `
      const ${ProviderIdentifier} = require('./${EntryTemplateName}').default;
      ReactDOM.render(
        React.createElement(
          ${ProviderIdentifier},
          null,
          React.createElement(
            require('./router').default
          )
        ),
        document.getElementById('root')
      );
      `.trim());
  });

  /**
   * Support resolve 'mobx', 'mobx-react', 'mobx-state-tree'
   */
  api.register('modifyAFWebpackOpts', ({ memo, args }: ReducerArg<AfWebpackOptions, undefined>) => {
    memo.alias = {
      ...memo.alias,
      'mobx': require.resolve('mobx'),
      'mobx-react': require.resolve('mobx-react'),
      'mobx-state-tree': require.resolve('mobx-state-tree')
    };
    return memo;
  });

  /**
   * Modify temp/router.js
   * add getHoc(...) import.
   */
  api.register('modifyRouterFile', ({ memo }: ReducerArg<string, undefined>) => {
    return memo
      .replace(IMPORT, `import getHoc from './withProvider';\n${IMPORT}`.trim());
  });

  /**
   * Wrap every routes' component.
   */
  api.register('modifyRouteComponent', ({ memo, args }: ReducerArg<string, {
    isCompiling: boolean,
    pageJSFile: string,
    importPath: string,
    webpackChunkName: string,
    config: PluginAPI['service']['config']
  }>) => {
    const { pageJSFile, webpackChunkName, config: umiConfig } = args;

    if (!webpackChunkName) {
      return memo;
    }

    let loadingComponent = '';
    if (umiConfig.loading) {
      loadingComponent = `require('${normalizePath(join(paths.cwd, umiConfig.loading))}').default`;
    }

    memo = `getHoc({ <% STORES %> }, ${loadingComponent})(${memo})`
      .replace(
        '<% STORES %>',
        useExclude(umiResolver
          .getPageModelPaths({
            cwd: join(paths.absTmpDirPath, pageJSFile),
            absPagesPath: paths.absPagesPath,
            absSrcPath: paths.absSrcPath,
            singular: umiConfig.singular
          }), excluesList)
          .map((path) => {
            const name = getName(path);
            const importTarget = shouldImportDynamic ?
              `import(/* webpackChunkName: '${chunkName(paths.cwd, path)}' */ '${path}')` :
              `require(/* webpackChunkName: '${chunkName(paths.cwd, path)}' */ '${path}').default`;
            return `['${name}']: () => ${importTarget},`;
          }).join('\n')
      );

    return memo;
  });

  /**
   * Add watchers.
   */
  api.register('modifyPageWatchers', ({ memo, args }: ReducerArg<string[], undefined>) => {
    return [
      ...memo,
      join(paths.absSrcPath, umiResolver.pluralName),
      join(paths.absSrcPath, umiResolver.singularName + '.js'),
      join(paths.absSrcPath, umiResolver.singularName + '.jsx'),
      join(paths.absSrcPath, umiResolver.singularName + '.ts'),
      join(paths.absSrcPath, umiResolver.singularName + '.tsx'),
      join(paths.absSrcPath, 'mobx.js'),
      join(paths.absSrcPath, 'mobx.jsx'),
      join(paths.absSrcPath, 'mobx.ts'),
      join(paths.absSrcPath, 'mobx.tsx')
    ];
  });
}
