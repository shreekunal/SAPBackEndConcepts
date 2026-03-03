using {sales as db} from '../db/schema';

service SalesService {

    entity Customers       as projection on db.Customers;
    entity SalesOrders     as projection on db.SalesOrders;
    entity SalesOrderItems as projection on db.SalesOrderItems;

    action createOrder(
        customerId  : UUID,
        orderDate   : Date,
        items       : array of {
            productName : String(100);
            quantity    : Integer;
            price       : Decimal(15, 2);
        }
    ) returns SalesOrders;
}