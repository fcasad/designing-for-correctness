import { flow as pipe } from 'fp-ts/lib/function'

import * as oo_polymorphism from "./implementations/oo.polymorphism";
import * as oo_visitorPattern from "./implementations/oo.visitorPattern";
import * as fp_algebraicTypes from "./implementations/fp.algebraicTypes";

const testHappyPath_01 = () => {
  const { EmptyOrder, OrderItem } = oo_polymorphism;

  return new EmptyOrder()
    .addItem(new OrderItem("a", 7))
    .addItem(new OrderItem("b", 3))
    .addItem(new OrderItem("c", 5))
    .removeItem("b")
    .pay(12)
    .complete();
};

const testHappyPath_02 = () => {
  const {
    EmptyOrder,
    OrderItem,
    AddItemVisitor,
    RemoveItemVisitor,
    PayVisitor,
    CompleteVisitor
  } = oo_visitorPattern;

  return new EmptyOrder()
    .accept(new AddItemVisitor(new OrderItem("a", 7)))
    .accept(new AddItemVisitor(new OrderItem("b", 3)))
    .accept(new AddItemVisitor(new OrderItem("c", 5)))
    .accept(new RemoveItemVisitor("b"))
    .accept(new PayVisitor(12))
    .accept(new CompleteVisitor());
};

const testHappyPath_03 = () => {
  const { createOrder, addItem, removeItem, pay, complete } = fp_algebraicTypes;

  return pipe(
    createOrder,
    addItem({ id: "a", price: 7 }),
    addItem({ id: "b", price: 3 }),
    addItem({ id: "c", price: 5 }),
    removeItem("b"),
    pay(12),
    complete
  )();
};

const main = () => {
  try {
    const result = testHappyPath_03();
    console.log(result);
  } catch (err) {
    console.log(err.message);
  }
};

main();
