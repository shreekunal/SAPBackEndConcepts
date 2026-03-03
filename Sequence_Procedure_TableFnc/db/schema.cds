namespace sales;

using {
  cuid,
  managed
} from '@sap/cds/common';

entity Customers : cuid, managed {
  name  : String(100) @mandatory;
  email : String(100) @assert.format: '^[^\s@]+@[^\s@]+\.[^\s@]+$';
  phone : String(15);
  city  : String(50);
}

entity SalesOrders : cuid, managed {
  orderNo     : String(20)               @mandatory;
  orderDate   : Date                     @mandatory;
  status      : String(20) enum {
    NEW;
    PROCESSING;
    COMPLETED;
    CANCELLED;
  } default 'NEW';

  totalAmount : Decimal(15, 2);

  customer    : Association to Customers @mandatory;

  items       : Composition of many SalesOrderItems on items.parent = $self;
}

entity SalesOrderItems : cuid {
  parent      : Association to SalesOrders;
  productName : String(100)    @mandatory;
  quantity    : Integer        @mandatory  @assert.range: [
    1,
    1000
  ];
  price       : Decimal(15, 2) @mandatory;

  itemTotal   : Decimal(15, 2);
}
