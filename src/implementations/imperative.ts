export interface IOrderItem {
  id: string;
  price: number;
}

export interface IOrder {
  items: IOrderItem[];
  amountPaid: number;
  amountRefunded: number;
  completedAt: Date;
  addItem(item: IOrderItem): IOrder;
  removeItem(itemId: string): IOrder;
  pay(amount: number): IOrder;
  refund(amount: number): IOrder;
  complete(): IOrder;
}

export class OrderItem implements IOrderItem {
  constructor(public id: string, public price: number) {}
}

export class Order implements IOrder {
  items: IOrderItem[] = [];
  amountPaid = 0;
  amountRefunded = 0;
  completedAt: Date = null;
  private _isPaid = false;
  private _isRefunded = false;

  private get _isEmpty() {
    return this.items.length === 0;
  }

  private get _isCompleted() {
    return this.completedAt !== null;
  }

  addItem(item: IOrderItem): IOrder {
    if (this._isPaid) {
      throw new Error('Cannot modify already paid order');
    }
    this.items.push(item);
    return this;
  }

  removeItem(itemId: string): IOrder {
    if (this._isPaid) {
      throw new Error('Cannot modify already paid order');
    }
    const index = this.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
    return this;
  }

  pay(amount: number): IOrder {
    if (this._isEmpty) {
      throw new Error('Cannot pay for order with no order items');
    }
    if (this._isPaid) {
      throw new Error('Cannot pay for already paid order');
    }
    this.amountPaid = amount;
    this._isPaid = true;
    return this;
  }

  refund(amount: number): IOrder {
    if (!this._isPaid) {
      throw new Error('Cannot refund unpaid order');
    }
    if (this._isRefunded) {
      throw new Error('Cannot refund already refunded order');
    }
    if (this._isCompleted) {
      throw new Error('Cannot refund completed order');
    }
    this.amountRefunded = amount;
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
    this.completedAt = new Date();
    return this;
  }
}
