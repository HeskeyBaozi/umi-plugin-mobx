import { AxiosResponse } from 'axios';
import { flow, types } from 'mobx-state-tree';
import { Loading } from '../../../stores/$loading';
import { $ } from '../../../utils';
import { User } from './$user';

const Users = types
  .compose(Loading, types.model({
    list: types.array(User),
    total: types.maybe(types.number),
    page: types.maybe(types.number)
  }))
  .named('users')
  .volatile(() => {
    return {
      PAGE_SIZE: 5
    };
  })
  .actions((self) => {
    return {
      fetchAsync: flow(function* fetchAsync({ page }: { page: number }) {
        const { data, headers }: AxiosResponse<any[]> = yield $.get(`/users?_page=${page}&_limit=${self.PAGE_SIZE}`);
        self.list.clear();
        self.list.push(...data);
        self.total = Number.parseInt(headers['x-total-count'], 10);
        self.page = page;
      }),
      removeAsync: flow(function* removeAsync({ id }: { id: number }) {
        yield $.delete(`/users/${id}`);
      }),
      updateAsync: flow(function* updateAsync({ id, values }: { id: number, values: object }) {
        yield $.patch(`/users/${id}`, JSON.stringify(values));
      }),
      createAsync: flow(function* createAsync({ values }: { values: object }) {
        yield $.post(`/users`, JSON.stringify(values));
      })
    };
  });

export type UsersType = typeof Users.Type;
export default Users.create({
  list: []
});
