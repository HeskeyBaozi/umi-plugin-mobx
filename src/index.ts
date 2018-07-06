import { PluginAPI, ReducerArg, AfWebpackOptions, PluginOptions } from './api';
import { resolve, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import UmiResolver from './utils/resolver';
import { sync } from 'globby';
import { normalizePath, getName, chunkName, transformWord } from './utils/helpers';

export default function umiPluginMobx(api: PluginAPI, options: PluginOptions = {}) {
  const { RENDER, IMPORT } = api.placeholder;
  const { paths, config } = api.service;
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldImportDynamic = isProduction && !config.disableDynamicImport;
  let { modelName = 'store', exclude = [/^\$/] } = options;
  if (!exclude || !Array.isArray(exclude)) {
    exclude = [];
  };

  if (exclude instanceof RegExp) {
    exclude = [exclude];
  }

  const umiResolver = new UmiResolver(modelName);
  const pluralName = transformWord(modelName, false);
  const singularName = transformWord(modelName, true);

  function getMobxConfig() {
    const mobxs = sync('./mobx.{ts,js,tsx,jsx}', { cwd: paths.absSrcPath });
    if (mobxs.length) {
      return normalizePath(mobxs[0]);
    }
  }

  api.register('generateFiles', ({ memo, args }) => {

    let entryTemplateContent = readFileSync(
      resolve(__dirname, './template/entry.template.js'), { encoding: 'utf8' }
    );

    const modelPaths = umiResolver.getGlobalModelPaths({
      absSrcPath: api.service.paths.absSrcPath,
      absPagesPath: api.service.paths.absPagesPath,
      config: api.service.config
    });
    const identifiers = UmiResolver.exclude(modelPaths, exclude)
      .map((path) => ({
        name: getName(path),
        path
      }))
      .filter((_) => _.name);



    const identifiersContent = identifiers
      .map(({ name, path }) => `
    const mobx${name} = (require('${path}').default);
    `.trim())
      .join('\n');

    const restContent = identifiers.map(({ name, path }) => {
      return `
    [ getType(mobx${name}).name === 'AnonymousModel' ? '${name}' : getType(mobx${name}).name ]: mobx${name},
        `.trim()
    }).join('\n');

    const summary = `
      const mobxStores = {
        ${restContent}
  };
      `.trim();

    const mobxConfig = getMobxConfig();
    if (mobxConfig) {
      entryTemplateContent = entryTemplateContent
        .replace('/*<% MOBX_CONFIG %>*/', `((require('${
          normalizePath(resolve(paths.absSrcPath, mobxConfig))
        }').config || (() => ({})))())`)
    }

    entryTemplateContent = entryTemplateContent
      .replace('/*<% MOBX_CONFIG %>*/', `{}`)
      .replace('/*<% MOBX_STORES %>*/', `
    ${identifiersContent}\n${summary}
    `.trim())
      .replace('/*<% GLOBAL_MODELS %>*/', '{ ...mobxStores },');

    writeFileSync(
      join(paths.absTmpDirPath, './MobxProviderEntry.js'),
      entryTemplateContent,
      'utf8'
    );

    writeFileSync(
      join(paths.absTmpDirPath, './withProvider.js'),
      readFileSync(resolve(__dirname, './withProvider.js'), { encoding: 'utf8' }),
      'utf8'
    );

    return memo;
  });

  api.register('modifyEntryFile', ({ memo, args }: ReducerArg<string, undefined>) => {
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

  api.register('modifyAFWebpackOpts', ({ memo, args }: ReducerArg<AfWebpackOptions, undefined>) => {
    memo.alias = {
      ...memo.alias,
      'mobx': require.resolve('mobx'),
      'mobx-react': require.resolve('mobx-react'),
      'mobx-state-tree': require.resolve('mobx-state-tree')
    };
    return memo;
  });

  api.register('modifyRouterFile', ({ memo }: ReducerArg<string, undefined>) => {
    return memo
      .replace(IMPORT, `
import getHoc from './withProvider';
${IMPORT}`.trim());
  });

  api.register('modifyRouteComponent', ({ memo, args }: ReducerArg<string, {
    isCompiling: boolean,
    pageJSFile: string,
    importPath: string,
    webpackChunkName: string,
    config: PluginAPI['service']['config']
  }>) => {
    const { pageJSFile, webpackChunkName, config } = args;
    if (!webpackChunkName) {
      return memo;
    }

    let loadingComponent = '';
    if (config.loading) {
      loadingComponent = `require('${normalizePath(
        join(paths.cwd, config.loading),
      )}').default`;
    }

    memo = `getHoc({
      <% STORES %>
    }, ${loadingComponent})(${memo})`
      .replace(
        '<% STORES %>',
        umiResolver
          .getPageModelPaths({
            cwd: join(paths.absTmpDirPath, pageJSFile),
            absPagesPath: paths.absPagesPath,
            absSrcPath: paths.absSrcPath,
            singular: config.singular
          })
          .map((path) => {
            const name = getName(path);
            const importTarget = shouldImportDynamic ? `import(/* webpackChunkName: '${chunkName(
              paths.cwd,
              path,
            )}' */ '${path}')` : `require(/* webpackChunkName: '${chunkName(
              paths.cwd,
              path,
            )}' */ '${path}').default`;
            return `['${name}']: () => ${importTarget},`;
          }).join('\n')
      );

    return memo;
  });

  api.register('modifyPageWatchers', ({ memo, args }: ReducerArg<string[], undefined>) => {
    return [
      ...memo,
      join(paths.absSrcPath, pluralName),
      join(paths.absSrcPath, singularName + '.js'),
      join(paths.absSrcPath, singularName + '.jsx'),
      join(paths.absSrcPath, singularName + '.ts'),
      join(paths.absSrcPath, singularName + '.tsx'),
      join(paths.absSrcPath, 'mobx.js'),
      join(paths.absSrcPath, 'mobx.jsx'),
      join(paths.absSrcPath, 'mobx.ts'),
      join(paths.absSrcPath, 'mobx.tsx')
    ];
  });
}
