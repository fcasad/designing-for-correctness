export interface IOrderItem {
  id: string;
  price: number;
}

export interface IOrder {
  items: IOrderItem[];
  isPaid: boolean;
  amountPaid: number;
  isRefunded: boolean;
  amountRefunded: number;
  completedAt: Date;
  addItem(item: IOrderItem): IOrder;
  removeItem(itemId: string): IOrder;
  pay(): IOrder;
  refund(): IOrder;
  complete(): IOrder;
}

export class OrderItem implements IOrderItem {
  constructor(public id: string, public price: number) {}
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
    return this._items.map(item => ({ ...item }));
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
    const amountToPay = this._items.reduce((amount, item) => amount + item.price, 0);
    this._amountPaid = amountToPay;
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
