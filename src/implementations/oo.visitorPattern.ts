export interface IOrderItem {
  readonly id: string;
  readonly price: number;
}

// Separation of data and behavior -- notice how each behavior is moved into it's own class
// which explicitly specifies how to operate on each state.  Adding new behaviors is now
// done in a single place without worry about interfering with existing ones
// But this pattern causes extra boilerplate, indirection, and less clearly represents the domain
// Ie what is a 'Visitor', can you 'accept' an order?
export interface IOrder {
  readonly items: ReadonlyArray<IOrderItem>;
  readonly amountPaid: number;
  readonly amountRefunded: number;
  readonly completedAt: Date;
  accept(visitor: IOrderVisitor): IOrder;
}

export interface IOrderVisitor {
  visitEmpty(empty: EmptyOrder): IOrder;
  visitActive(active: ActiveOrder): IOrder;
  visitPaid(paid: PaidOrder): IOrder;
  visitRefunded(refunded: RefundedOrder): IOrder;
  visitCompleted(completed: CompletedOrder): IOrder;
}

export class OrderItem implements IOrderItem {
  constructor(private _id: string, private _price: number) {}

  get id() {
    return this._id;
  }

  get price() {
    return this._price;
  }
}

abstract class BaseOrder implements IOrder {
  get items() {
    return this._items;
  }

  get amountPaid() {
    return this._amountPaid;
  }

  get amountRefunded() {
    return this._amountRefunded;
  }

  get completedAt() {
    return this._completedAt;
  }

  constructor(
    protected _items: IOrderItem[] = [],
    protected _amountPaid = 0,
    protected _amountRefunded = 0,
    protected _completedAt: Date = null
  ) {}

  abstract accept(visitor: IOrderVisitor): IOrder;
}

export class EmptyOrder extends BaseOrder {
  constructor() {
    super();
  }

  accept(visitor: IOrderVisitor): IOrder {
    return visitor.visitEmpty(this);
  }
}

export class ActiveOrder extends BaseOrder {
  constructor(items: IOrderItem[]) {
    super(items);
  }

  accept(visitor: IOrderVisitor): IOrder {
    return visitor.visitActive(this);
  }
}

export class PaidOrder extends BaseOrder {
  constructor(items: IOrderItem[], amountPaid: number) {
    super(items, amountPaid);
  }

  accept(visitor: IOrderVisitor): IOrder {
    return visitor.visitPaid(this);
  }
}

export class CompletedOrder extends BaseOrder {
  constructor(items: IOrderItem[], amountPaid: number, completedAt: Date) {
    super(items, amountPaid, undefined, completedAt);
  }

  accept(visitor: IOrderVisitor): IOrder {
    return visitor.visitCompleted(this);
  }
}

export class RefundedOrder extends BaseOrder {
  constructor(items: IOrderItem[], amountPaid: number, amountRefunded: number) {
    super(items, amountPaid, amountRefunded);
  }

  accept(visitor: IOrderVisitor): IOrder {
    return visitor.visitRefunded(this);
  }
}

export class AddItemVisitor implements IOrderVisitor {
  constructor(private _item: IOrderItem) {}

  get item() {
    return this._item;
  }

  visitEmpty(empty: EmptyOrder): IOrder {
    return new ActiveOrder([this.item]);
  }

  visitActive(active: ActiveOrder): IOrder {
    const newItems = active.items.concat(this.item);
    return new ActiveOrder(newItems);
  }

  visitPaid(paid: PaidOrder): IOrder {
    throw new Error('Cannot modify already paid order');
  }

  visitRefunded(refunded: RefundedOrder): IOrder {
    throw new Error('Cannot modify already paid order');
  }

  visitCompleted(completed: CompletedOrder): IOrder {
    throw new Error('Cannot modify already paid order');
  }
}

export class RemoveItemVisitor implements IOrderVisitor {
  constructor(private _itemId: string) {}

  get itemId() {
    return this._itemId;
  }

  visitEmpty(empty: EmptyOrder): IOrder {
    return empty;
  }

  visitActive(active: ActiveOrder): IOrder {
    const newItems = active.items.filter(item => item.id !== this.itemId);
    return newItems.length > 0 ? new ActiveOrder(newItems) : new EmptyOrder();
  }

  visitPaid(paid: PaidOrder): IOrder {
    throw new Error('Cannot modify already paid order');
  }

  visitRefunded(refunded: RefundedOrder): IOrder {
    throw new Error('Cannot modify already paid order');
  }

  visitCompleted(completed: CompletedOrder): IOrder {
    throw new Error('Cannot modify already paid order');
  }
}

export class PayVisitor implements IOrderVisitor {
  visitEmpty(empty: EmptyOrder): IOrder {
    throw new Error('Cannot pay for order with no order items');
  }

  visitActive(active: ActiveOrder): IOrder {
    const amount = active.items.reduce((amount, item) => amount + item.price, 0);
    return new PaidOrder(active.items.slice(), amount);
  }

  visitPaid(paid: PaidOrder): IOrder {
    throw new Error('Cannot pay for already paid order');
  }

  visitRefunded(refunded: RefundedOrder): IOrder {
    throw new Error('Cannot pay for already paid order');
  }

  visitCompleted(completed: CompletedOrder): IOrder {
    throw new Error('Cannot pay for already paid order');
  }
}

export class RefundVisitor implements IOrderVisitor {
  visitEmpty(empty: EmptyOrder): IOrder {
    throw new Error('Cannot refund unpaid order');
  }

  visitActive(active: ActiveOrder): IOrder {
    throw new Error('Cannot refund unpaid order');
  }

  visitPaid(paid: PaidOrder): IOrder {
    const amountRefunded = paid.amountPaid;
    return new RefundedOrder(paid.items.slice(), paid.amountPaid, amountRefunded);
  }

  visitRefunded(refunded: RefundedOrder): IOrder {
    throw new Error('Cannot refund already refunded order');
  }

  visitCompleted(completed: CompletedOrder): IOrder {
    throw new Error('Cannot refund completed order');
  }
}

export class CompleteVisitor implements IOrderVisitor {
  visitEmpty(empty: EmptyOrder): IOrder {
    throw new Error('Cannot complete unpaid order');
  }

  visitActive(active: ActiveOrder): IOrder {
    throw new Error('Cannot complete unpaid order');
  }

  visitPaid(paid: PaidOrder): IOrder {
    return new CompletedOrder(paid.items.slice(), paid.amountPaid, new Date(Date.now()));
  }

  visitRefunded(refunded: RefundedOrder): IOrder {
    throw new Error('Cannot complete refunded order');
  }

  visitCompleted(completed: CompletedOrder): IOrder {
    return completed;
  }
}
