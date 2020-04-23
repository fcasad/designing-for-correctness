export interface IOrderItem {
  readonly id: string;
  readonly price: number;
}

export interface IOrder {
  readonly items: ReadonlyArray<IOrderItem>;
  readonly isPaid: boolean;
  readonly amountPaid: number;
  readonly isRefunded: boolean;
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

export class Order implements IOrder {
  private _items: IOrderItem[] = [];
  private _isPaid = false;
  private _amountPaid = 0;
  private _isRefunded = false;
  private _amountRefunded = 0;
  private _completedAt: Date = null;

  private get _isEmpty() {
    return this._items.length === 0;
  }

  private get _isCompleted() {
    return this._completedAt !== null;
  }

  get items() {
    return this._items;
  }

  get isPaid() {
    return this._isPaid;
  }

  get amountPaid() {
    return this._amountPaid;
  }

  get isRefunded() {
    return this._isRefunded;
  }

  get amountRefunded() {
    return this._amountRefunded;
  }

  get completedAt() {
    return this._completedAt;
  }

  addItem(item: IOrderItem): IOrder {
    if (this._isPaid) {
      throw new Error('Cannot modify already paid order');
    }
    this._items.push(item);
    return this;
  }

  removeItem(itemId: string): IOrder {
    if (this._isPaid) {
      throw new Error('Cannot modify already paid order');
    }
    const index = this._items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this._items.splice(index, 1);
    }
    return this;
  }

  pay(): IOrder {
    if (this._isEmpty) {
      throw new Error('Cannot pay for order with no order items');
    }
    if (this._isPaid) {
      throw new Error('Cannot pay for already paid order');
    }
    const amount = this._items.reduce((amount, item) => amount + item.price, 0);
    this._amountPaid = amount;
    this._isPaid = true;
    return this;
  }

  refund(): IOrder {
    if (!this._isPaid) {
      throw new Error('Cannot refund unpaid order');
    }
    if (this._isRefunded) {
      throw new Error('Cannot refund already refunded order');
    }
    if (this._isCompleted) {
      throw new Error('Cannot refund completed order');
    }
    this._amountRefunded = this._amountPaid;
    this._isRefunded = true;
    return this;
  }

  complete(): IOrder {
    if (!this._isPaid) {
      throw new Error('Cannot complete unpaid order');
    }
    if (this._isRefunded) {
      throw new Error('Cannot complete refunded order');
    }
    this._completedAt = new Date(Date.now());
    return this;
  }
}

// Notes:
// - Encapsulation: the entire state of the order is hidden and only readable via getters,
//     and modifiable by public methods. we may need to use specific data types to enforce this (ie ReadonlyArray)
//     but this is critical to ensure the invariants of the order
// - Our code has a lot of implicit state however... this and the branching logic can easily get out of control
// - There are additional data consistency concerns for our design with boolean flags (these need to stay in sync):
//   -- order with payment amount must have paid flag set to true
//   -- order with refund amount must have refunded flag set to true
