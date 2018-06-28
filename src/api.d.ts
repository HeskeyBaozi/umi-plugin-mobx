export default class PluginAPI {
  register: (key: string, fn: (...args: any[]) => any) => void;
}
