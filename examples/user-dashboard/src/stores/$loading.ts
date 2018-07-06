import { addMiddleware, applyAction, onSnapshot, types } from 'mobx-state-tree';

export const Loading = types
  .model('Loading', {
    loading: types.optional(types.map(types.frozen), {})
  })
  .actions((self) => {

    addMiddleware(self, (call, next) => {
      if (/Async$/.test(call.name)) {
        if (call.type === 'flow_spawn') {
          applyAction(self, { name: 'startLoading', args: [call.name, call.args] });
        } else if (call.type === 'flow_return' || call.type === 'flow_throw') {
          applyAction(self, { name: 'endLoading', args: [call.name] });
        }
      }
      return next(call);
    });

    return {
      startLoading(name: string, args: any[]) {
        self.loading.set(name, args);
      },
      endLoading(name: string) {
        self.loading.delete(name);
      }
    };
  });

export type LoadingType = typeof Loading.Type;
