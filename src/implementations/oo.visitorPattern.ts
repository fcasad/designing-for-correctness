export interface IOrderItem {
  id: string;
  price: number;
}

export interface IOrderVisitor {
  visitEmpty(empty: EmptyOrder): IOrder;
  visitActive(active: ActiveOrder): IOrder;
  visitPaid(paid: PaidOrder): IOrder;
  visitRefunded(refunded: RefundedOrder): IOrder;
  visitCompleted(completed: CompletedOrder): IOrder;
}

export interface IOrder {
  accept(visitor: IOrderVisitor): IOrder;
}

export class OrderItem implements IOrderItem {
  constructor(public id: string, public price: number) {}
}

export class EmptyOrder implements IOrder {
  addItem(item: IOrderItem): IOrder {
    return new ActiveOrder([item]);
  }

  accept(visitor: IOrderVisitor): IOrder {
    return visitor.visitEmpty(this);
  }
}

export class ActiveOrder implements IOrder {
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

  accept(visitor: IOrderVisitor): IOrder {
    return visitor.visitActive(this);
  }
}

export class PaidOrder implements IOrder {
  constructor(public items: IOrderItem[], public amountPaid: number) {}

  refund(amount: number): IOrder {
    return new RefundedOrder(this.items, this.amountPaid, amount);
  }

  complete(): IOrder {
    return new CompletedOrder(this.items, this.amountPaid, new Date());
  }

  accept(visitor: IOrderVisitor): IOrder {
    return visitor.visitPaid(this);
  }
}

export class CompletedOrder implements IOrder {
  constructor(
    public items: IOrderItem[],
    public amountPaid: number,
    public completedAt: Date
  ) {}

  accept(visitor: IOrderVisitor): IOrder {
    return visitor.visitCompleted(this);
  }
}

export class RefundedOrder implements IOrder {
  constructor(
    public items: IOrderItem[],
    public amountPaid: number,
    public amountRefunded: number
  ) {}

  accept(visitor: IOrderVisitor): IOrder {
    return visitor.visitRefunded(this);
  }
}

export class AddItemVisitor implements IOrderVisitor {
  constructor(public item: IOrderItem) {}

  visitEmpty(empty: EmptyOrder): IOrder {
    return empty.addItem(this.item);
  }

  visitActive(active: ActiveOrder): IOrder {
    return active.addItem(this.item);
  }

  visitPaid(paid: PaidOrder): IOrder {
    return paid;
  }

  visitRefunded(refunded: RefundedOrder): IOrder {
    return refunded;
  }

  visitCompleted(completed: CompletedOrder): IOrder {
    return completed;
  }
}

export class RemoveItemVisitor implements IOrderVisitor {
  constructor(public itemId: string) {}

  visitEmpty(empty: EmptyOrder): IOrder {
    return empty;
  }

  visitActive(active: ActiveOrder): IOrder {
    return active.removeItem(this.itemId);
  }

  visitPaid(paid: PaidOrder): IOrder {
    return paid;
  }

  visitRefunded(refunded: RefundedOrder): IOrder {
    return refunded;
  }

  visitCompleted(completed: CompletedOrder): IOrder {
    return completed;
  }
}

export class PayVisitor implements IOrderVisitor {
  constructor(public amount: number) {}

  visitEmpty(empty: EmptyOrder): IOrder {
    return empty;
  }

  visitActive(active: ActiveOrder): IOrder {
    return active.pay(this.amount);
  }

  visitPaid(paid: PaidOrder): IOrder {
    return paid;
  }

  visitRefunded(refunded: RefundedOrder): IOrder {
    return refunded;
  }

  visitCompleted(completed: CompletedOrder): IOrder {
    return completed;
  }
}

export class RefundVisitor implements IOrderVisitor {
  constructor(public amount: number) {}

  visitEmpty(empty: EmptyOrder): IOrder {
    return empty;
  }

  visitActive(active: ActiveOrder): IOrder {
    return active;
  }

  visitPaid(paid: PaidOrder): IOrder {
    return paid.refund(this.amount);
  }

  visitRefunded(refunded: RefundedOrder): IOrder {
    return refunded;
  }

  visitCompleted(completed: CompletedOrder): IOrder {
    return completed;
  }
}

export class CompleteVisitor implements IOrderVisitor {
  visitEmpty(empty: EmptyOrder): IOrder {
    return empty;
  }

  visitActive(active: ActiveOrder): IOrder {
    return active;
  }

  visitPaid(paid: PaidOrder): IOrder {
    return paid.complete();
  }

  visitRefunded(refunded: RefundedOrder): IOrder {
    return refunded;
  }

  visitCompleted(completed: CompletedOrder): IOrder {
    return completed;
  }
}
