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

export class EmptyOrder implements IOrder {
  items: IOrderItem[] = [];
  amountPaid = 0;
  amountRefunded = 0;
  completedAt: Date = null;

  addItem(item: IOrderItem): IOrder {
    return new ActiveOrder([item]);
  }

  removeItem(itemId: string): IOrder {
    return this;
  }

  pay(amount: number): IOrder {
    return this;
  }

  refund(amount: number): IOrder {
    return this;
  }

  complete(): IOrder {
    return this;
  }
}

export class ActiveOrder implements IOrder {
  amountPaid = 0;
  amountRefunded = 0;
  completedAt: Date = null;

  constructor(public items: IOrderItem[]) {}

  addItem(item: IOrderItem): IOrder {
    const newItems = this.items.concat(item);
    return new ActiveOrder(newItems);
  }

  removeItem(itemId: string): IOrder {
    const newItems = this.items.filter(item => item.id !== itemId);
    return newItems.length > 0 ? new ActiveOrder(newItems) : new EmptyOrder();
  }

  pay(amount: number): IOrder {
    return new PaidOrder(this.items, amount);
  }

  refund(amount: number): IOrder {
    return this;
  }

  complete(): IOrder {
    return this;
  }
}

export class PaidOrder implements IOrder {
  amountRefunded = 0;
  completedAt: Date = null;

  constructor(public items: IOrderItem[], public amountPaid: number) {}

  addItem(item: IOrderItem): IOrder {
    return this;
  }

  removeItem(itemId: string): IOrder {
    return this;
  }

  pay(amount: number): IOrder {
    return this;
  }

  refund(amount: number): IOrder {
    return this;
  }

  complete(): IOrder {
    return this;
  }
}

export class CompletedOrder implements IOrder {
  amountRefunded = 0;

  constructor(public items: IOrderItem[], public amountPaid: number, public completedAt: Date) {}

  addItem(item: IOrderItem): IOrder {
    return this;
  }

  removeItem(itemId: string): IOrder {
    return this;
  }

  pay(amount: number): IOrder {
    return this;
  }

  refund(amount: number): IOrder {
    return this;
  }

  complete(): IOrder {
    return this;
  }
}

export class RefundedOrder implements IOrder {
  completedAt: Date = null;

  constructor(
    public items: IOrderItem[],
    public amountPaid: number,
    public amountRefunded: number
  ) {}

  addItem(item: IOrderItem): IOrder {
    return this;
  }

  removeItem(itemId: string): IOrder {
    return this;
  }

  pay(amount: number): IOrder {
    return this;
  }

  refund(amount: number): IOrder {
    return this;
  }

  complete(): IOrder {
    return this;
  }
}
