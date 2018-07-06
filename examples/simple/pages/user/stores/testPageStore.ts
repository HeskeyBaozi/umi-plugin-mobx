// tslint:disable
import { types } from 'mobx-state-tree';

const Test = types.model('testPageStoreInnerName', {
  count: types.number
});

export default Test.create({
  count: 3
});
