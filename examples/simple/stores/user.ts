import { types, getType } from 'mobx-state-tree';

export const Item = types
  .model('item', {
    key: types.string,
    content: types.string
  });

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
  .actions((self) => ({
    changeFirstName(str: string) {
      self.firstName = str;
    }
  }));

const user = User.create({
  firstName: 'Heskey',
  lastName: 'Baozi',
  age: 20,
  list: []
});

export type UserType = typeof User.Type;

export default user;
