import { pipe } from 'fp-ts/lib/pipeable';
import { Either, chain, fold } from 'fp-ts/lib/Either';

import * as imperative from './implementations/00-imperative';
import * as encapsulation from './implementations/01-oo.encapsulation';
import * as oo_polymorphism from './implementations/02-oo.polymorphism';
import * as oo_visitorPattern from './implementations/03-oo.visitorPattern';
import * as fp_unionType from './implementations/04-fp.unionType';
import * as fp_pure from './implementations/05-fp.pure';

const testHappyPath_00 = () => {
  const { OrderItem, Order, OrderService } = imperative;

  const orderService = new OrderService();
  const order = new Order();
  orderService.addItem(order, new OrderItem('a', 7));
  orderService.addItem(order, new OrderItem('b', 3));
  orderService.addItem(order, new OrderItem('c', 5));
  orderService.removeItem(order, 'b');
  orderService.pay(order);
  orderService.complete(order);
  return order;
};

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

// adapt fp-pure to throw like other implementations
const throwErr = (e: any) => {
  throw new Error(String(e));
};
const identity = <T>(x: T): T => x;
const getRightOrThrow = <E, A>(ma: Either<E, A>): A | never => pipe(ma, fold(throwErr, identity));

const testHappyPath_05 = () => {
  const { emptyOrder, addItem, removeItem, pay, complete } = fp_pure;

  return pipe(
    emptyOrder,
    addItem({ id: 'a', price: 7 }),
    chain(addItem({ id: 'b', price: 3 })),
    chain(addItem({ id: 'c', price: 5 })),
    chain(removeItem('b')),
    chain(pay),
    chain(complete),
    getRightOrThrow
  );
};

const main = () => {
  try {
    const result = testHappyPath_00();
    console.log(result);
  } catch (err) {
    console.log(err.message);
  }
};

main();
