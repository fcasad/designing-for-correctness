export type OrderItem = { id: string; price: number };

export type Order = EmptyOrder | ActiveOrder | PaidOrder | CompletedOrder | RefundedOrder;

export type EmptyOrder = { tag: 'Empty' };

export type ActiveOrder = { tag: 'Active'; items: OrderItem[] };

export type PaidOrder = { tag: 'Paid'; items: OrderItem[]; amountPaid: number };

export type CompletedOrder = {
  tag: 'Completed';
  items: OrderItem[];
  amountPaid: number;
  completedAt: Date;
};

export type RefundedOrder = {
  tag: 'Refunded';
  items: OrderItem[];
  amountPaid: number;
  amountRefunded: number;
};

export const assertUnreachable = (x: never): never => {
  throw new Error('Should not reach here');
};

export const createOrder = (): Order => ({ tag: 'Empty' });

export const addItem = (item: OrderItem) => (order: Order): Order => {
  switch (order.tag) {
    case 'Empty':
      return { tag: 'Active', items: [item] };
    case 'Active':
      return { ...order, items: order.items.concat(item) };
    case 'Paid':
    case 'Completed':
    case 'Refunded':
      return order;
  }
  assertUnreachable(order);
};

export const removeItem = (itemId: string) => (order: Order): Order => {
  switch (order.tag) {
    case 'Active':
      const newItems = order.items.filter(item => item.id !== itemId);
      return newItems.length > 0 ? { ...order, items: newItems } : { tag: 'Empty' };
    case 'Empty':
    case 'Paid':
    case 'Completed':
    case 'Refunded':
      return order;
  }
  assertUnreachable(order);
};

export const pay = (amount: number) => (order: Order): Order => {
  switch (order.tag) {
    case 'Active':
      return { ...order, tag: 'Paid', amountPaid: amount };
    case 'Empty':
    case 'Paid':
    case 'Completed':
    case 'Refunded':
      return order;
  }
  assertUnreachable(order);
};

export const refund = (amount: number) => (order: Order): Order => {
  switch (order.tag) {
    case 'Paid':
      return { ...order, tag: 'Refunded', amountRefunded: amount };
    case 'Empty':
    case 'Active':
    case 'Completed':
    case 'Refunded':
      return order;
  }
  assertUnreachable(order);
};

export const complete = (order: Order): Order => {
  switch (order.tag) {
    case 'Paid':
      return { ...order, tag: 'Completed', completedAt: new Date() };
    case 'Empty':
    case 'Active':
    case 'Completed':
    case 'Refunded':
      return order;
  }
  assertUnreachable(order);
};
