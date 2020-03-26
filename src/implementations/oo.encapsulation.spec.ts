import { Order, OrderItem } from './oo.encapsulation';

describe('Order', () => {
  describe('constructor', () => {
    it('should have correct initial values', () => {
      const order = new Order();

      expect(order).toMatchObject({
        items: [],
        isPaid: false,
        amountPaid: 0,
        isRefunded: false,
        amountRefunded: 0,
        completedAt: null
      });
    });
  });

  describe('addItem', () => {
    it('should add item to order', () => {
      const order = new Order();
      const item = new OrderItem('a', 5);
      order.addItem(item);

      expect(order.items).toContainEqual(item);
    });

    it('should throw and not add item if order is paid', () => {
      expect.assertions(2);

      const order = new Order();
      order.addItem(new OrderItem('a', 5));
      order.pay();
      const itemB = new OrderItem('b', 7);

      try {
        order.addItem(itemB);
      } catch (err) {
        expect(order.items).not.toContainEqual(itemB);
        expect(err).toEqual(new Error('Cannot modify already paid order'));
      }
    });
  });

  describe('removeItem', () => {
    it('should remove item from order if it exists', () => {
      const order = new Order();
      const itemA = new OrderItem('a', 5);
      const itemB = new OrderItem('b', 7);
      order.addItem(itemA);
      order.addItem(itemB);
      order.removeItem('a');

      expect(order.items).not.toContainEqual(itemA);
    });

    it('should handle when item not found', () => {
      const order = new Order();
      const itemA = new OrderItem('a', 5);
      order.addItem(itemA);
      order.removeItem('b');

      expect(order.items).toContainEqual(itemA);
    });

    it('should throw and not remove item if order is paid', () => {
      expect.assertions(2);

      const order = new Order();
      const item = new OrderItem('a', 5);
      order.addItem(item);
      order.pay();

      try {
        order.removeItem(item.id);
      } catch (err) {
        expect(order.items).toContainEqual(item);
        expect(err).toEqual(new Error('Cannot modify already paid order'));
      }
    });
  });

  describe('pay', () => {
    it('should set correct amount paid on order', () => {
      const order = new Order();
      order.addItem(new OrderItem('a', 5));
      order.addItem(new OrderItem('b', 7));
      order.pay();

      expect(order.amountPaid).toBe(12);
    });

    it('should throw and not set amount paid if order has no items', () => {
      expect.assertions(2);

      const order = new Order();
      try {
        order.pay();
      } catch (err) {
        expect(order.amountPaid).toBe(0);
        expect(err).toEqual(new Error('Cannot pay for order with no order items'));
      }
    });

    it('should throw if order has already been paid', () => {
      expect.assertions(1);

      const order = new Order();
      order.addItem(new OrderItem('a', 5));
      order.addItem(new OrderItem('b', 7));
      order.pay();

      try {
        order.pay();
      } catch (err) {
        expect(err).toEqual(new Error('Cannot pay for already paid order'));
      }
    });
  });

  describe('refund', () => {
    it('should set correct amount refunded on order', () => {
      const order = new Order();
      order.addItem(new OrderItem('a', 5));
      order.addItem(new OrderItem('b', 7));
      order.pay();
      order.refund();

      expect(order.amountRefunded).toBe(12);
    });

    it('should throw and not set amount refunded if order is unpaid', () => {
      expect.assertions(2);

      const order = new Order();
      order.addItem(new OrderItem('a', 5));
      order.addItem(new OrderItem('b', 7));

      try {
        order.refund();
      } catch (err) {
        expect(order.amountRefunded).toBe(0);
        expect(err).toEqual(new Error('Cannot refund unpaid order'));
      }
    });

    it('should throw if order has already been refunded', () => {
      expect.assertions(1);

      const order = new Order();
      order.addItem(new OrderItem('a', 5));
      order.addItem(new OrderItem('b', 7));
      order.pay();
      order.refund();

      try {
        order.refund();
      } catch (err) {
        expect(err).toEqual(new Error('Cannot refund already refunded order'));
      }
    });

    it('should throw if order has already been completed', () => {
      expect.assertions(1);

      const order = new Order();
      order.addItem(new OrderItem('a', 5));
      order.addItem(new OrderItem('b', 7));
      order.pay();
      order.complete();

      try {
        order.refund();
      } catch (err) {
        expect(err).toEqual(new Error('Cannot refund completed order'));
      }
    });
  });

  describe('complete', () => {
    const now = 0;

    beforeAll(() => {
      jest.spyOn(Date, 'now').mockImplementationOnce(() => now);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should set completed date of order', () => {
      const order = new Order();
      order.addItem(new OrderItem('a', 5));
      order.addItem(new OrderItem('b', 7));
      order.pay();
      order.complete();

      expect(order.completedAt).toEqual(new Date(now));
    });

    it('should throw and not set completed date if order is unpaid', () => {
      expect.assertions(2);

      const order = new Order();
      order.addItem(new OrderItem('a', 5));
      order.addItem(new OrderItem('b', 7));

      try {
        order.complete();
      } catch (err) {
        expect(order.completedAt).toBe(null);
        expect(err).toEqual(new Error('Cannot complete unpaid order'));
      }
    });

    it('should throw and not set completed date if  order is refunded', () => {
      expect.assertions(2);

      const order = new Order();
      order.addItem(new OrderItem('a', 5));
      order.addItem(new OrderItem('b', 7));
      order.pay();
      order.refund();

      try {
        order.complete();
      } catch (err) {
        expect(order.completedAt).toBe(null);
        expect(err).toEqual(new Error('Cannot complete refunded order'));
      }
    });
  });
});

// Basic Functionality:
// * create order
// * add order item to order
// * remove order item from order
// * pay for order
// * refund order
// * complete order

// Business Rules:
// * cannot modify paid order
// * cannot pay for order with no items, or already paid order
// * can only refund paid orders, which are not already refunded or completed
// * can only complete paid orders, which are not refunded

// Properties / Invariants:
// * always -
// * 1 paid order must have items
// * 2 refunded order must be paid
// * 3 therefore: refunded order must have items
// * 4 completed order must be paid
// * 5 therefore: completed order must have items
// * never -
// * 6 refunded order must not be completed
// * 7 therefore: completed order must not be refunded
// * (implicit)
// * 8. amount paid must never be negative
// * 9. amount refunded must never be negative
// * 10. amount refunded must never be greater than amount paid

// * Additional data consistency concerns for our design with boolean flags:
// * 0.1 order with payment amount must have paid flag set to true
// * 0.2 order with refund amount must have refunded flag set to true

// const breaks_invariant_1 = {
//   items: [],
//   isPaid: true,
//   amountPaid: 12,
//   isRefunded: false,
//   amountRefunded: 0,
//   completedAt: null
// };

// const breaks_invariant_2 = {
//   items: [{ id: 'a', price: 12 }],
//   isPaid: false,
//   amountPaid: 0,
//   isRefunded: true,
//   amountRefunded: 12,
//   completedAt: null
// };

// // implied by ^
// const breaks_invariant_3 = {
//   items: [],
//   isPaid: true,
//   amountPaid: 12,
//   isRefunded: true,
//   amountRefunded: 12,
//   completedAt: null
// };

// const breaks_invariant_4 = {
//   items: [{ id: 'a', price: 12 }],
//   isPaid: false,
//   amountPaid: 0,
//   isRefunded: false,
//   amountRefunded: 0,
//   completedAt: '2020-03-24T07:17:19.416Z'
// };

// // implied by ^
// const breaks_invariant_5 = {
//   items: [],
//   isPaid: true,
//   amountPaid: 12,
//   isRefunded: false,
//   amountRefunded: 0,
//   completedAt: '2020-03-24T07:17:19.416Z'
// };

// const breaks_invariant_6and7 = {
//   items: [{ id: 'a', price: 12 }],
//   isPaid: true,
//   amountPaid: 12,
//   isRefunded: true,
//   amountRefunded: 12,
//   completedAt: '2020-03-24T07:17:19.416Z'
// };

// const consistency_issue_01 = {
//   items: [{ id: 'a', price: 12 }],
//   isPaid: false,
//   amountPaid: 12,
//   isRefunded: false,
//   amountRefunded: 0,
//   completedAt: '2020-03-24T07:17:19.416Z'
// };

// const consistency_issue_02 = {
//   items: [{ id: 'a', price: 12 }],
//   isPaid: true,
//   amountPaid: 12,
//   isRefunded: false,
//   amountRefunded: 12,
//   completedAt: '2020-03-24T07:17:19.416Z'
// };
