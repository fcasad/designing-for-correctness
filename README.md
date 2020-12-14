# designing-for-correctness

### WIP

Heavily derivative of these excellent posts on Scott Wlaschin's blog:

* https://fsharpforfunandprofit.com/posts/designing-for-correctness/
* https://fsharpforfunandprofit.com/csharp/union-types-in-csharp.html

### For all implementations:

##### Use Cases:
* create order
* add order item to order
* remove order item from order
* pay for order
* refund order
* complete order

##### Business Rules:
* cannot modify paid order
* cannot pay for order with no items, or already paid order
* can only refund paid orders, which are not already refunded or completed
* can only complete paid orders, which are not refunded

##### Properties / Invariants:
* Always true:
  1. paid order must have items
  1. refunded order must be paid
  1. therefore: refunded order must have items
  1. completed order must be paid
  1. therefore: completed order must have items
* Never true:
  1. refunded order must not be completed
  1. therefore: completed order must not be refunded
