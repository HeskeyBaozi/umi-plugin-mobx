// tslint:disable
import { types, flow } from 'mobx-state-tree';

export const Item = types
  .model('item', {
    key: types.string,
    content: types.string
  });

type ItemSnapshotType = typeof Item.SnapshotType;

const User = types
  .model({
    firstName: types.string,
    lastName: types.string,
    age: types.number,
    list: types.array(Item)
  })
  .views((self) => ({
    get name() {
      return self.firstName + ' ' + self.lastName;
    }
  }))
  .volatile((self) => ({
    uid: 0
  }))
  .actions((self) => ({
    changeFirstName(str: string) {
      self.firstName = str;
    },
    addListItemAsync: flow(function* addListItemAsync() {
      const currentUid = self.uid++;
      const item: ItemSnapshotType = yield new Promise<ItemSnapshotType>((resolve) => setTimeout(() => {
        resolve({
          key: 'item-' + currentUid,
          content: 'this is content...'
        });
      }, 1000));
      self.list.push(Item.create(item));
    })
  }))


export type UserType = typeof User.Type;

export default User.create({
  firstName: 'Heskey',
  lastName: 'Baozi',
  age: 20,
  list: []
});
