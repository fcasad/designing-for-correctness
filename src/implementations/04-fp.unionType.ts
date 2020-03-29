export type ErrorMessage = string;

export type OrderItem = Readonly<{ id: string; price: number }>;

export type Order = EmptyOrder | ActiveOrder | PaidOrder | CompletedOrder | RefundedOrder;

export type EmptyOrder = Readonly<{ tag: 'Empty' }>;

export type ActiveOrder = Readonly<{ tag: 'Active'; items: ReadonlyArray<OrderItem> }>;

export type PaidOrder = Readonly<{
  tag: 'Paid';
  items: ReadonlyArray<OrderItem>;
  amountPaid: number;
}>;

export type CompletedOrder = Readonly<{
  tag: 'Completed';
  items: ReadonlyArray<OrderItem>;
  amountPaid: number;
  completedAt: Date;
}>;

export type RefundedOrder = Readonly<{
  tag: 'Refunded';
  items: ReadonlyArray<OrderItem>;
  amountPaid: number;
  amountRefunded: number;
}>;

const assertUnreachable = (x: never): never => {
  throw new Error('Should not reach here');
};

export const emptyOrder: EmptyOrder = { tag: 'Empty' };

type AddItem = (item: OrderItem) => (order: Order) => ActiveOrder;
export const addItem: AddItem = item => order => {
  switch (order.tag) {
    case 'Empty':
      return { tag: 'Active', items: [item] };
    case 'Active':
      return { ...order, items: order.items.concat(item) };
    case 'Paid':
    case 'Completed':
    case 'Refunded':
      throw new Error('Cannot modify already paid order');
  }
  assertUnreachable(order);
};

type RemoveItem = (itemId: string) => (order: Order) => EmptyOrder | ActiveOrder;
export const removeItem: RemoveItem = itemId => order => {
  switch (order.tag) {
    case 'Empty':
      return order;
    case 'Active':
      const items = order.items.filter(item => item.id !== itemId);
      return items.length > 0 ? { ...order, items } : emptyOrder;
    case 'Paid':
    case 'Completed':
    case 'Refunded':
      throw new Error('Cannot modify already paid order');
  }
  assertUnreachable(order);
};

type Pay = (order: Order) => PaidOrder;
export const pay: Pay = order => {
  switch (order.tag) {
    case 'Empty':
      throw new Error('Cannot pay for order with no order items');
    case 'Active':
      const amountPaid = order.items.reduce((amount, item) => amount + item.price, 0);
      return { ...order, tag: 'Paid', amountPaid };
    case 'Paid':
    case 'Completed':
    case 'Refunded':
      throw new Error('Cannot pay for already paid order');
  }
  assertUnreachable(order);
};

type Refund = (order: Order) => RefundedOrder;
export const refund: Refund = order => {
  switch (order.tag) {
    case 'Empty':
    case 'Active':
      throw new Error('Cannot refund unpaid order');
    case 'Paid':
      return { ...order, tag: 'Refunded', amountRefunded: order.amountPaid };
    case 'Completed':
      throw new Error('Cannot refund completed order');
    case 'Refunded':
      throw new Error('Cannot refund already refunded order');
  }
  assertUnreachable(order);
};

type Complete = (order: Order) => CompletedOrder;
export const complete: Complete = order => {
  switch (order.tag) {
    case 'Empty':
    case 'Active':
      throw new Error('Cannot complete unpaid order');
    case 'Paid':
      return { ...order, tag: 'Completed', completedAt: new Date(Date.now()) };
    case 'Completed':
      return order;
    case 'Refunded':
      throw new Error('Cannot complete refunded order');
  }
  assertUnreachable(order);
};

// A few notes:
// - data and behavior are still separate but with significantly less boilerplate
// - the assertUnreachable fn (as well as explicitly tagging our Order types) is necessary since JS doesn't have pattern matching like f#
// - we can reuse the same instance of empty order since our records are immutable
// - the union type (ln 5) is taking the place of polymorphism
// - most importantly the code reflects the domain: "an order is either an empty order _or_ active order _or_..."
