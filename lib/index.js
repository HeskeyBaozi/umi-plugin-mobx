'use strict';

var pluralize = require('pluralize');
var globby = require('globby');
var path = require('path');
var fs = require('fs');

function transformWord(word, toSingular) {
    if (pluralize.isPlural(word)) {
        return toSingular ? pluralize.singular(word) : word;
    }
    else {
        return toSingular ? word : pluralize.plural(word);
    }
}
function optsToArray(item) {
    if (!item) {
        return [];
    }
    if (Array.isArray(item)) {
        return item;
    }
    else {
        return [item];
    }
}
function normalizePath(path$$1, stripTrailing) {
    if (typeof path$$1 !== 'string') {
        throw new TypeError('expected path to be a string');
    }
    if (path$$1 === '\\' || path$$1 === '/') {
        return '/';
    }
    const len = path$$1.length;
    if (len <= 1) {
        return path$$1;
    }
    // ensure that win32 namespaces has two leading slashes, so that the path is
    // handled properly by the win32 version of path.parse() after being normalized
    // https://msdn.microsoft.com/library/windows/desktop/aa365247(v=vs.85).aspx#namespaces
    let prefix = '';
    if (len > 4 && path$$1[3] === '\\') {
        const ch = path$$1[2];
        if ((ch === '?' || ch === '.') && path$$1.slice(0, 2) === '\\\\') {
            path$$1 = path$$1.slice(2);
            prefix = '//';
        }
    }
    const segs = path$$1.split(/[/\\]+/);
    if (stripTrailing !== false && segs[segs.length - 1] === '') {
        segs.pop();
    }
    return prefix + segs.join('/');
}
function endWithSlash(path$$1) {
    return path$$1.slice(-1) !== '/' ? `${path$$1}/` : path$$1;
}
function getName(path$$1) {
    return (path$$1.split('/').pop() || '').replace(/\..+$/, '');
}
function chunkName(cwd, path$$1) {
    return stripFirstSlash(normalizePath(path$$1).replace(normalizePath(cwd), '')).replace(/\//g, '__');
}
function stripFirstSlash(path$$1) {
    if (path$$1.charAt(0) === '/') {
        return path$$1.slice(1);
    }
    else {
        return path$$1;
    }
}
function useExclude(models, excludes) {
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

// tslint:disable-next-line:no-var-requires
const uniq = require('lodash.uniq');
/**
 * Use the rule which is same with umi-plugin-dva.
 * Reference: https://github.com/umijs/umi/blob/master/packages/umi-plugin-dva/src/index.js
 */
class UmiResolver {
    constructor(targetName) {
        this.targetName = targetName;
        this.pluralName = transformWord(targetName, false);
        this.singularName = transformWord(targetName, true);
    }
    getModelPaths(cwd, singular) {
        const singularModel = globby.sync(`./${transformWord(this.targetName, true)}.{ts,tsx,js,jsx}`, { cwd });
        // choose model.js, not models folder.
        if (singularModel.length) {
            return uniq(singularModel.map((path$$1) => normalizePath(path.join(cwd, path$$1))));
        }
        return uniq(globby.sync(`./${transformWord(this.targetName, singular)}/**/*.{ts,tsx,js,jsx}`, { cwd })
            .filter((path$$1) => !/\.(d|test)\.[tj]sx?$/.test(path$$1))
            .map((path$$1) => normalizePath(path.join(cwd, path$$1))));
    }
    getGlobalModelPaths({ absSrcPath, absPagesPath, config }) {
        return uniq([...this.getModelPaths(absSrcPath, config.singular),
            ...this.getModelPaths(absPagesPath, config.singular)]);
    }
    getPageModelPaths({ cwd, absPagesPath, absSrcPath, singular }) {
        let modelPaths = [];
        cwd = path.dirname(cwd);
        while (!(endWithSlash(normalizePath(cwd)) === endWithSlash(normalizePath(absPagesPath))) &&
            !(endWithSlash(normalizePath(cwd)) === endWithSlash(normalizePath(absSrcPath))) &&
            !(cwd === path.join(cwd, '../') || path.join(cwd, '../') === './')) {
            modelPaths = [...modelPaths, ...this.getModelPaths(cwd, singular)];
            cwd = path.dirname(cwd);
        }
        return uniq(modelPaths);
    }
    getMobxConfig(cwd) {
        const mobxs = globby.sync('./mobx.{ts,js,tsx,jsx}', { cwd });
        if (mobxs.length) {
            return normalizePath(mobxs[0]);
        }
    }
}

function umiPluginMobx(api, options = {}) {
    const { RENDER, IMPORT } = api.placeholder;
    const { paths, config } = api.service;
    const isProduction = process.env.NODE_ENV === 'production';
    const shouldImportDynamic = isProduction && !config.disableDynamicImport;
    const { modelName = 'store', exclude = [/^\$/] } = options;
    const umiResolver = new UmiResolver(modelName);
    const excluesList = optsToArray(exclude);
    api.register('generateFiles', ({ memo, args }) => {
        let entryTemplateContent = fs.readFileSync(path.resolve(__dirname, './template/entry.template.js'), { encoding: 'utf8' });
        const identifiers = useExclude(umiResolver.getGlobalModelPaths({
            absSrcPath: api.service.paths.absSrcPath,
            absPagesPath: api.service.paths.absPagesPath,
            config: api.service.config
        }), excluesList)
            .map((path$$1) => ({ name: getName(path$$1), path: path$$1 }))
            .filter((_) => _.name);
        const identifiersContent = identifiers
            .map(({ name, path: path$$1 }) => `const mobx${name} = (require('${path$$1}').default);`.trim())
            .join('\n');
        const restContent = identifiers
            .map(({ name }) => `[ getType(mobx${name}).name === 'AnonymousModel' ? '${name}' : getType(mobx${name}).name ]: mobx${name},`)
            .join('\n');
        const summary = `const mobxStores = { ${restContent} };`.trim();
        const mobxConfig = umiResolver.getMobxConfig(paths.absSrcPath);
        if (mobxConfig) {
            entryTemplateContent = entryTemplateContent
                .replace('/*<% MOBX_CONFIG %>*/', `((require('${normalizePath(path.resolve(paths.absSrcPath, mobxConfig))}').config || (() => ({})))())`);
        }
        entryTemplateContent = entryTemplateContent
            .replace('/*<% MOBX_CONFIG %>*/', `{}`)
            .replace('/*<% MOBX_STORES %>*/', `${identifiersContent}\n${summary}`.trim())
            .replace('/*<% GLOBAL_MODELS %>*/', '{ ...mobxStores },');
        fs.writeFileSync(path.join(paths.absTmpDirPath, './MobxProviderEntry.js'), entryTemplateContent, 'utf8');
        fs.writeFileSync(path.join(paths.absTmpDirPath, './withProvider.js'), fs.readFileSync(path.resolve(__dirname, './withProvider.js'), { encoding: 'utf8' }), 'utf8');
        return memo;
    });
    api.register('modifyEntryFile', ({ memo }) => {
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
    api.register('modifyAFWebpackOpts', ({ memo, args }) => {
        memo.alias = Object.assign({}, memo.alias, { 'mobx': require.resolve('mobx'), 'mobx-react': require.resolve('mobx-react'), 'mobx-state-tree': require.resolve('mobx-state-tree') });
        return memo;
    });
    api.register('modifyRouterFile', ({ memo }) => {
        return memo
            .replace(IMPORT, `import getHoc from './withProvider';\n${IMPORT}`.trim());
    });
    api.register('modifyRouteComponent', ({ memo, args }) => {
        const { pageJSFile, webpackChunkName, config: umiConfig } = args;
        if (!webpackChunkName) {
            return memo;
        }
        let loadingComponent = '';
        if (umiConfig.loading) {
            loadingComponent = `require('${normalizePath(path.join(paths.cwd, umiConfig.loading))}').default`;
        }
        memo = `getHoc({ <% STORES %> }, ${loadingComponent})(${memo})`
            .replace('<% STORES %>', useExclude(umiResolver
            .getPageModelPaths({
            cwd: path.join(paths.absTmpDirPath, pageJSFile),
            absPagesPath: paths.absPagesPath,
            absSrcPath: paths.absSrcPath,
            singular: umiConfig.singular
        }), excluesList)
            .map((path$$1) => {
            const name = getName(path$$1);
            const importTarget = shouldImportDynamic ?
                `import(/* webpackChunkName: '${chunkName(paths.cwd, path$$1)}' */ '${path$$1}')` :
                `require(/* webpackChunkName: '${chunkName(paths.cwd, path$$1)}' */ '${path$$1}').default`;
            return `['${name}']: () => ${importTarget},`;
        }).join('\n'));
        return memo;
    });
    api.register('modifyPageWatchers', ({ memo, args }) => {
        return [
            ...memo,
            path.join(paths.absSrcPath, umiResolver.pluralName),
            path.join(paths.absSrcPath, umiResolver.singularName + '.js'),
            path.join(paths.absSrcPath, umiResolver.singularName + '.jsx'),
            path.join(paths.absSrcPath, umiResolver.singularName + '.ts'),
            path.join(paths.absSrcPath, umiResolver.singularName + '.tsx'),
            path.join(paths.absSrcPath, 'mobx.js'),
            path.join(paths.absSrcPath, 'mobx.jsx'),
            path.join(paths.absSrcPath, 'mobx.ts'),
            path.join(paths.absSrcPath, 'mobx.tsx')
        ];
    });
}

module.exports = umiPluginMobx;
