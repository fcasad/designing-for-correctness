import { ReadonlyNonEmptyArray, snoc, filter, reduce } from 'fp-ts/lib/ReadonlyNonEmptyArray';
import { Either, left, right } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { toNullable } from 'fp-ts/lib/Option';

export type ErrorMessage = string;

export type OrderItem = Readonly<{ id: string; price: number }>;

export type Order = EmptyOrder | ActiveOrder | PaidOrder | CompletedOrder | RefundedOrder;

export type EmptyOrder = Readonly<{ tag: 'Empty' }>;

export type ActiveOrder = Readonly<{ tag: 'Active'; items: ReadonlyNonEmptyArray<OrderItem> }>;

export type PaidOrder = Readonly<{
  tag: 'Paid';
  items: ReadonlyNonEmptyArray<OrderItem>;
  amountPaid: number;
}>;

export type CompletedOrder = Readonly<{
  tag: 'Completed';
  items: ReadonlyNonEmptyArray<OrderItem>;
  amountPaid: number;
  completedAt: Date;
}>;

export type RefundedOrder = Readonly<{
  tag: 'Refunded';
  items: ReadonlyNonEmptyArray<OrderItem>;
  amountPaid: number;
  amountRefunded: number;
}>;

const assertUnreachable = (x: never): never => {
  throw new Error('Should not reach here');
};

export const emptyOrder: EmptyOrder = { tag: 'Empty' };

type AddItem = (item: OrderItem) => (order: Order) => Either<ErrorMessage, ActiveOrder>;
export const addItem: AddItem = item => order => {
  switch (order.tag) {
    case 'Empty':
      return right({ tag: 'Active', items: [item] });
    case 'Active':
      return right({ ...order, items: snoc(order.items, item) });
    case 'Paid':
    case 'Completed':
    case 'Refunded':
      return left('Cannot modify already paid order');
  }
  assertUnreachable(order);
};

type RemoveItem = (
  itemId: string
) => (order: Order) => Either<ErrorMessage, EmptyOrder | ActiveOrder>;
export const removeItem: RemoveItem = itemId => order => {
  switch (order.tag) {
    case 'Empty':
      return right(order);
    case 'Active':
      const items = pipe(
        order.items,
        filter(item => item.id !== itemId),
        toNullable
      );
      return right(items ? { ...order, items } : emptyOrder);
    case 'Paid':
    case 'Completed':
    case 'Refunded':
      return left('Cannot modify already paid order');
  }
  assertUnreachable(order);
};

type Pay = (order: Order) => Either<ErrorMessage, PaidOrder>;
export const pay: Pay = order => {
  switch (order.tag) {
    case 'Empty':
      return left('Cannot pay for order with no order items');
    case 'Active':
      const amountPaid = pipe(
        order.items,
        reduce(0, (amount, item) => amount + item.price)
      );
      return right({ ...order, tag: 'Paid', amountPaid });
    case 'Paid':
    case 'Completed':
    case 'Refunded':
      return left('Cannot pay for already paid order');
  }
  assertUnreachable(order);
};

type Refund = (order: Order) => Either<ErrorMessage, RefundedOrder>;
export const refund: Refund = order => {
  switch (order.tag) {
    case 'Empty':
    case 'Active':
      return left('Cannot refund unpaid order');
    case 'Paid':
      return right({ ...order, tag: 'Refunded', amountRefunded: order.amountPaid });
    case 'Completed':
      return left('Cannot refund completed order');
    case 'Refunded':
      return left('Cannot refund already refunded order');
  }
  assertUnreachable(order);
};

type Complete = (order: Order) => Either<ErrorMessage, CompletedOrder>;
export const complete: Complete = order => {
  switch (order.tag) {
    case 'Empty':
    case 'Active':
      return left('Cannot complete unpaid order');
    case 'Paid':
      return right({ ...order, tag: 'Completed', completedAt: new Date(Date.now()) });
    case 'Completed':
      return right(order);
    case 'Refunded':
      return left('Cannot complete refunded order');
  }
  assertUnreachable(order);
};

// Notes: This code solves 2 additional problems:
// 1.  We said we want to make impossible states impossible.  Items cannot be empty so we've introduced
//     a new type - ReadonlyNonEmptyArray. We can use a lib like here or create these ourselves.
//     Creating additional value objects would help enforce price, amount paid etc are _non negative_ numbers
//     or other invariants.  This can be done in the OO implementations as well.
// 2.  All of our previous examples were not fully type-safe since we were throwing exceptions.  Now the
//     exception handling is wrapped in another type (Either monad).  This just encapsulates the possibility
//     of success or failure (right or left)
