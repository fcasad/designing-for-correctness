import { pipe } from 'fp-ts/lib/pipeable';

import * as encapsulation from './implementations/01-oo.encapsulation';
import * as oo_polymorphism from './implementations/02-oo.polymorphism';
import * as oo_visitorPattern from './implementations/03-oo.visitorPattern';
import * as fp_unionType from './implementations/04-fp.unionType';
import * as fp_pure from './implementations/05-fp.pure.ts';

const testHappyPath_01 = () => {
  const { Order, OrderItem } = encapsulation;

  return new Order()
    .addItem(new OrderItem('a', 7))
    .addItem(new OrderItem('b', 3))
    .addItem(new OrderItem('c', 5))
    .removeItem('b')
    .pay()
    .complete();
};

const testHappyPath_02 = () => {
  const { EmptyOrder, OrderItem } = oo_polymorphism;

  return new EmptyOrder()
    .addItem(new OrderItem('a', 7))
    .addItem(new OrderItem('b', 3))
    .addItem(new OrderItem('c', 5))
    .removeItem('b')
    .pay()
    .complete();
};

const testHappyPath_03 = () => {
  const {
    EmptyOrder,
    OrderItem,
    AddItemVisitor,
    RemoveItemVisitor,
    PayVisitor,
    CompleteVisitor
  } = oo_visitorPattern;

  return new EmptyOrder()
    .accept(new AddItemVisitor(new OrderItem('a', 7)))
    .accept(new AddItemVisitor(new OrderItem('b', 3)))
    .accept(new AddItemVisitor(new OrderItem('c', 5)))
    .accept(new RemoveItemVisitor('b'))
    .accept(new PayVisitor())
    .accept(new CompleteVisitor());
};

const testHappyPath_04 = () => {
  const { emptyOrder, addItem, removeItem, pay, complete } = fp_unionType;

  return pipe(
    emptyOrder,
    addItem({ id: 'a', price: 7 }),
    addItem({ id: 'b', price: 3 }),
    addItem({ id: 'c', price: 5 }),
    removeItem('b'),
    pay,
    complete
  );
};

const testHappyPath_05 = () => {
  const { emptyOrder, addItem, removeItem, pay, complete } = fp_pure;

  return pipe(
    emptyOrder,
    addItem({ id: 'a', price: 7 }),
    addItem({ id: 'b', price: 3 }),
    addItem({ id: 'c', price: 5 }),
    removeItem('b'),
    pay,
    complete
  );
};

const main = () => {
  try {
    const result = testHappyPath_01();
    console.log(result);
  } catch (err) {
    console.log(err.message);
  }
};

main();
