import { pipe } from 'fp-ts/lib/pipeable';
import { last } from 'fp-ts/lib/ReadonlyNonEmptyArray';
import { Either, isRight, isLeft, fold } from 'fp-ts/lib/Either';

import {
  emptyOrder,
  addItem,
  removeItem,
  pay,
  refund,
  complete,
  OrderItem,
  EmptyOrder,
  ActiveOrder,
  PaidOrder,
  RefundedOrder,
  CompletedOrder
} from './fp.algebraicTypes';

// utils
const NULL = (): null => null;
const identity = <T>(x: T): T => x;
const getRight = <E, A>(ma: Either<E, A>): A | null => pipe(ma, fold(NULL, identity));
const getLeft = <E, A>(ma: Either<E, A>): E | null => pipe(ma, fold(identity, NULL));

// fixtures
const itemA: OrderItem = { id: 'a', price: 5 };
const itemB: OrderItem = { id: 'b', price: 7 };
const itemC: OrderItem = { id: 'c', price: 3 };
const activeOrderFixtureWithOneItem: ActiveOrder = { tag: 'Active', items: [itemA] };
const activeOrderFixture: ActiveOrder = { tag: 'Active', items: [itemA, itemB] };
const paidOrderFixture: PaidOrder = { tag: 'Paid', items: [itemA, itemB], amountPaid: 12 };
const refundedOrderFixture: RefundedOrder = {
  tag: 'Refunded',
  items: [itemA, itemB],
  amountPaid: 12,
  amountRefunded: 12
};
const completedOrderFixture: CompletedOrder = {
  tag: 'Completed',
  items: [itemA, itemB],
  amountPaid: 12,
  completedAt: new Date(0)
};

describe('addItem', () => {
  describe('given empty order and item', () => {
    it('should result in active order which contains item added last', () => {
      const result = pipe(emptyOrder, addItem(itemC));

      expect(isRight(result)).toBe(true);
      expect(last(getRight(result).items)).toBe(itemC);
    });
  });

  describe('given active order and item', () => {
    it('should result in active order which contains item added last', () => {
      const result = pipe(activeOrderFixture, addItem(itemC));

      expect(isRight(result)).toBe(true);
      expect(last(getRight(result).items)).toBe(itemC);
    });
  });

  describe('given paid order and item', () => {
    it('should result in correct error message', () => {
      const result = pipe(paidOrderFixture, addItem(itemC));

      expect(isLeft(result)).toBe(true);
      expect(getLeft(result)).toBe('TODO--error msg');
    });
  });

  describe('given completed order and item', () => {
    it('should result in correct error message', () => {
      const result = pipe(completedOrderFixture, addItem(itemC));

      expect(isLeft(result)).toBe(true);
      expect(getLeft(result)).toBe('TODO--error msg');
    });
  });

  describe('given refunded order and item', () => {
    it('should result in correct error message', () => {
      const result = pipe(refundedOrderFixture, addItem(itemC));

      expect(isLeft(result)).toBe(true);
      expect(getLeft(result)).toBe('TODO--error msg');
    });
  });
});

describe('removeItem', () => {
  describe('given empty order and item id', () => {
    it('should result in empty order', () => {
      const result = pipe(emptyOrder, removeItem(itemA.id));

      expect(isRight(result)).toBe(true);
      expect(getRight(result)).toBe(emptyOrder);
    });
  });

  describe('given active order and item id', () => {
    it('should result in active order without item if item id matches', () => {
      const result = pipe(activeOrderFixture, removeItem(itemA.id));

      expect(isRight(result)).toBe(true);
      expect((getRight(result) as ActiveOrder).items).not.toContain(itemA);
    });

    it('should result in empty order if item id matches only item', () => {
      const result = pipe(activeOrderFixtureWithOneItem, removeItem(itemA.id));

      expect(isRight(result)).toBe(true);
      expect(getRight(result)).toBe(emptyOrder);
    });
  });

  describe('given paid order and item id', () => {
    it('should result in correct error message', () => {
      const result = pipe(paidOrderFixture, removeItem(itemA.id));

      expect(isLeft(result)).toBe(true);
      expect(getLeft(result)).toBe('TODO--error msg');
    });
  });

  describe('given completed order and item id', () => {
    it('should result in correct error message', () => {
      const result = pipe(completedOrderFixture, removeItem(itemA.id));

      expect(isLeft(result)).toBe(true);
      expect(getLeft(result)).toBe('TODO--error msg');
    });
  });

  describe('given refunded order and item id', () => {
    it('should result in correct error message', () => {
      const result = pipe(refundedOrderFixture, removeItem(itemA.id));

      expect(isLeft(result)).toBe(true);
      expect(getLeft(result)).toBe('TODO--error msg');
    });
  });
});

describe('pay', () => {
  describe('EmptyOrder', () => {});
  describe('ActiveOrder', () => {});
  describe('PaidOrder', () => {});
  describe('CompletedOrder', () => {});
  describe('RefundedOrder', () => {});
});

describe('refund', () => {
  describe('EmptyOrder', () => {});
  describe('ActiveOrder', () => {});
  describe('PaidOrder', () => {});
  describe('CompletedOrder', () => {});
  describe('RefundedOrder', () => {});
});

describe('complete', () => {
  describe('EmptyOrder', () => {});
  describe('ActiveOrder', () => {});
  describe('PaidOrder', () => {});
  describe('CompletedOrder', () => {});
  describe('RefundedOrder', () => {});
});
