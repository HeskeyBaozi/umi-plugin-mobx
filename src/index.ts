import { PluginAPI, ReducerArg, AfWebpackOptions, PluginOptions } from './api';
import { resolve, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import UmiResolver from './utils/resolver';

export default function umiPluginMobx(api: PluginAPI, options: PluginOptions = {}) {
  const { RENDER } = api.placeholder;
  const { paths } = api.service;
  let { modelName = 'store', exclude = [/^\$/] } = options;
  if (!exclude || !Array.isArray(exclude)) {
    exclude = [];
  };

  if (exclude instanceof RegExp) {
    exclude = [exclude];
  }

  const umiResolver = new UmiResolver(modelName);

  api.register('generateFiles', ({ memo, args }) => {

    let entryTemplateContent = readFileSync(
      resolve(__dirname, './template/entry.template.js'), { encoding: 'utf8' }
    );

    const modelPaths = umiResolver.getGlobalModelPaths({
      absSrcPath: api.service.paths.absSrcPath,
      config: api.service.config
    });
    const identifiers = UmiResolver.exclude(modelPaths, exclude)
      .map((path) => ({
        name: (path.split('/').pop() || '').replace(/\..+$/, ''),
        path
      }))
      .filter((_) => _.name);



    const identifiersContent = identifiers
      .map(({ name, path }) => `
    const mobx${name} = (require('${path}').default);
    `.trim())
      .join('\n')

      const restContent = identifiers.map(({ name, path }) => {
        return `
        [getType(mobx${name}).name === 'AnonymousModel' ? '${name}' : getType(mobx${name}).name]: mobx${name},
        `.trim()
      }).join('\n')

    const summary = `
      const mobxStores = {
        ${restContent}
      };
      `.trim();

    entryTemplateContent = entryTemplateContent
      .replace('/*<% MOBX_STORES %>*/', `
    ${identifiersContent}
    ${summary}
    `.trim())
      .replace('/*<% GLOBAL_MODELS %>*/', '{ ...mobxStores },');

    writeFileSync(
      join(paths.absTmpDirPath, './MobxProviderEntry.js'),
      entryTemplateContent,
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
}
