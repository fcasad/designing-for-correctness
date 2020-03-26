export interface IOrderItem {
  readonly id: string;
  readonly price: number;
}

// Abstraction -- Our abstraction is more generic without the boolean flags
export interface IOrder {
  readonly items: ReadonlyArray<IOrderItem>;
  readonly amountPaid: number;
  readonly amountRefunded: number;
  readonly completedAt: Date;
  addItem(item: IOrderItem): IOrder;
  removeItem(itemId: string): IOrder;
  pay(): IOrder;
  refund(): IOrder;
  complete(): IOrder;
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

// Inheritence -- we do not want to introduce a deep inheritance heirarchy
// but sparing usage like the abstract class here allows us to share common data, behavior
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

  abstract addItem(item: IOrderItem): IOrder;

  abstract removeItem(itemId: string): IOrder;

  abstract pay(): IOrder;

  abstract refund(): IOrder;

  abstract complete(): IOrder;
}

// Polymorphism -- by implementing multiple classes which override the behavior (methods) of their base class,
// specialization has occurred, which eliminates much of the branching logic. the flow of the program is much easier to reason about as a result
export class EmptyOrder extends BaseOrder {
  constructor() {
    super();
  }

  addItem(item: IOrderItem): IOrder {
    return new ActiveOrder([item]);
  }

  removeItem(itemId: string): IOrder {
    return this;
  }

  pay(): IOrder {
    throw new Error('Cannot pay for order with no order items');
  }

  refund(): IOrder {
    throw new Error('Cannot refund unpaid order');
  }

  complete(): IOrder {
    throw new Error('Cannot complete unpaid order');
  }
}

// Also notice we have identified that our Order can be in several different states and have represented that explicitly with the type system rather than boolean flags
export class ActiveOrder extends BaseOrder {
  constructor(items: IOrderItem[]) {
    super(items);
  }

  addItem(item: IOrderItem): IOrder {
    const items = this.items.concat(item);
    return new ActiveOrder(items);
  }

  removeItem(itemId: string): IOrder {
    const items = this.items.filter(item => item.id !== itemId);
    return items.length > 0 ? new ActiveOrder(items) : new EmptyOrder();
  }

  pay(): IOrder {
    const amount = this._items.reduce((amount, item) => amount + item.price, 0);
    return new PaidOrder(this.items.slice(), amount);
  }

  refund(): IOrder {
    throw new Error('Cannot refund unpaid order');
  }

  complete(): IOrder {
    throw new Error('Cannot complete unpaid order');
  }
}

export class PaidOrder extends BaseOrder {
  constructor(items: IOrderItem[], amountPaid: number) {
    super(items, amountPaid);
  }

  addItem(item: IOrderItem): IOrder {
    throw new Error('Cannot modify already paid order');
  }

  removeItem(itemId: string): IOrder {
    throw new Error('Cannot modify already paid order');
  }

  pay(): IOrder {
    throw new Error('Cannot pay for already paid order');
  }

  refund(): IOrder {
    const amountRefunded = this.amountPaid;
    return new RefundedOrder(this.items.slice(), this.amountPaid, amountRefunded);
  }

  complete(): IOrder {
    return new CompletedOrder(this.items.slice(), this.amountPaid, new Date(Date.now()));
  }
}

export class CompletedOrder extends BaseOrder {
  constructor(items: IOrderItem[], amountPaid: number, completedAt: Date) {
    super(items, amountPaid, undefined, completedAt);
  }

  addItem(item: IOrderItem): IOrder {
    throw new Error('Cannot modify already paid order');
  }

  removeItem(itemId: string): IOrder {
    throw new Error('Cannot modify already paid order');
  }

  pay(): IOrder {
    throw new Error('Cannot pay for already paid order');
  }

  refund(): IOrder {
    throw new Error('Cannot refund completed order');
  }

  complete(): IOrder {
    return this;
  }
}

export class RefundedOrder extends BaseOrder {
  constructor(items: IOrderItem[], amountPaid: number, amountRefunded: number) {
    super(items, amountPaid, amountRefunded);
  }

  addItem(item: IOrderItem): IOrder {
    throw new Error('Cannot modify already paid order');
  }

  removeItem(itemId: string): IOrder {
    throw new Error('Cannot modify already paid order');
  }

  pay(): IOrder {
    throw new Error('Cannot pay for already paid order');
  }

  refund(): IOrder {
    throw new Error('Cannot refund already refunded order');
  }

  complete(): IOrder {
    throw new Error('Cannot complete refunded order');
  }
}
