import { Resolve } from 'webpack';

export interface Service {
  paths: {
    absTmpDirPath: string;
    absSrcPath: string;
    cwd: string;
    absPagesPath: string;
  },
  config: {
    singular: boolean;
    loading: string;
    disableDynamicImport: boolean;
  }
}

export interface PlaceHolder {
  IMPORT: string;
  RENDER: string;
  ROUTER_MODIFIER: string;
  ROUTES_MODIFIER: string;
  HISTORY_MODIFIER: string;
}

export type RegisterableHooks = 'generateFiles' | 'modifyEntryFile' | 'modifyAFWebpackOpts' | 'modifyRouteComponent' | 'modifyRouterFile';

export interface ReducerArg<M, A> {
  memo: M;
  args: A;
}

export interface AfWebpackOptions {
  alias: Resolve['alias'];
}

export type TestFn = (k: string) => boolean;
export type Excludes = (RegExp | TestFn)[]

export interface PluginOptions {
  modelName?: 'model' | 'store';
  exclude?: Excludes;
}

export interface PluginAPI {
  register: <M, A>(hookName: RegisterableHooks, fn: (arg: ReducerArg<M, A>) => M) => void;
  service: Service;
  placeholder: PlaceHolder;
}
