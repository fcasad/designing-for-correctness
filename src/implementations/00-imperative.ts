export interface IOrderItem {
  id: string;
  price: number;
}

export interface IOrder {
  items: IOrderItem[];
  amountPaid: number;
  amountRefunded: number;
  completedAt: Date;
}

export interface IOrderService {
  addItem(order: IOrder, item: IOrderItem): void;
  removeItem(order: IOrder, itemId: string): void;
  pay(order: IOrder): void;
  refund(order: IOrder): void;
  complete(order: IOrder): void;
}

export class OrderItem implements IOrderItem {
  constructor(public id: string, public price: number) {}
}

export class Order implements IOrder {
  constructor(
    public items: IOrderItem[] = [],
    public amountPaid: number = 0,
    public amountRefunded: number = 0,
    public completedAt: Date = null
  ) {}
}

export class OrderService implements IOrderService {
  addItem(order: IOrder, item: IOrderItem): void {
    if (order.amountPaid > 0) {
      throw new Error('Cannot modify already paid order');
    }
    order.items.push(item);
  }

  removeItem(order: IOrder, itemId: string): void {
    if (order.amountPaid > 0) {
      throw new Error('Cannot modify already paid order');
    }
    const index = order.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      order.items.splice(index, 1);
    }
  }

  pay(order: IOrder): void {
    if (order.items.length === 0) {
      throw new Error('Cannot pay for order with no order items');
    }
    if (order.amountPaid > 0) {
      throw new Error('Cannot pay for already paid order');
    }
    const amount = order.items.reduce((amount, item) => amount + item.price, 0);
    order.amountPaid = amount;
  }

  refund(order: IOrder): void {
    if (order.amountPaid === 0) {
      throw new Error('Cannot refund unpaid order');
    }
    if (order.amountRefunded > 0) {
      throw new Error('Cannot refund already refunded order');
    }
    if (order.completedAt !== null) {
      throw new Error('Cannot refund completed order');
    }
    order.amountRefunded = order.amountPaid;
  }

  complete(order: IOrder): void {
    if (order.amountPaid === 0) {
      throw new Error('Cannot complete unpaid order');
    }
    if (order.amountRefunded > 0) {
      throw new Error('Cannot complete refunded order');
    }
    order.completedAt = new Date(Date.now());
  }
}

// Notes:
// This is the "simplest" of the implementations but it has a lot of problems.
// Even though we are using classes and even interfaces this is hardly OOP:
// 1. We use very basic abstraction: Order, OrderItem, and OrderService can be swapped out for their
// respective interfaces.  However where theres a 1 to 1 relationship between object and interface
// this isn't much of an advantage (except possibly for testing if our OrderService did async stuff)
// 2. Theres no encapsulation, the state of our objects are publicly exposed and mutable. That's bad because:
//   A. Any calling code (ie another service) with a reference to the object can modify it unintentionally or incorrectly
//   B. As a result of A, there is nothing at all enforcing our invariants
// 3. The code is fragile/implicit. ie, if payments or refunds of amount 0 are actually valid, we will have to change
// the code in multiple places
