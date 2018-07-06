import { types } from 'mobx-state-tree';

export const User = types
  .model('user', {
    id: types.identifier(types.number),
    name: types.string,
    username: types.string,
    email: types.string,
    address: types.model('address', {
      street: types.string,
      suite: types.string,
      city: types.string,
      zipcode: types.string,
      geo: types.model('geo', {
        lat: types.string,
        lng: types.string
      })
    }),
    phone: types.string,
    website: types.string,
    company: types.model('company', {
      name: types.string,
      catchPhrase: types.string,
      bs: types.string
    })
  });

export type UserType = typeof User.Type;
export type UserSnapshotType = typeof User.SnapshotType;
