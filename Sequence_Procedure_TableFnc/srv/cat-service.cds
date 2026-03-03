using {sales as db} from '../db/schema';

service SalesService {

    entity Customers       as projection on db.Customers;
    entity SalesOrders     as projection on db.SalesOrders;
    entity SalesOrderItems as projection on db.SalesOrderItems;

    action createOrder(customerId: UUID,
                       orderDate: Date,
                       items: array of {
        productName : String(100);
        quantity    : Integer;
        price       : Decimal(15, 2);
    })                                              returns SalesOrders;

    // Level 1: Simple - get total for one order
    action getOrderTotal(ID: UUID)                  returns Decimal;

    // Level 2: Medium - aggregate order stats for a customer
    action getCustomerSummary(customerId: UUID)     returns {
        customerName  : String(100);
        totalOrders   : Integer;
        totalSpent    : Decimal(15, 2);
        avgOrderValue : Decimal(15, 2);
        lastOrderDate : Date;
    };

    // Level 3: Medium-High - update status with business rule validation
    action updateOrderStatus(orderID: UUID,
                             newStatus: String(20)) returns {
        success   : String(5);
        message   : String(200);
        oldStatus : String(20);
        newStatus : String(20);
    };

    // Level 4: Complex - rank products by revenue using window functions
    action getTopProducts(topN: Integer)            returns array of {
        rank         : Integer;
        productName  : String(100);
        totalQty     : Integer;
        totalRevenue : Decimal(15, 2);
        orderCount   : Integer;
        avgPrice     : Decimal(15, 2);
    };

    // Table Function - get orders filtered by status
    function getOrdersByStatus(status: String(20)) returns array of {
        orderId      : UUID;
        orderNo      : String(20);
        orderDate    : Date;
        status       : String(20);
        totalAmount  : Decimal(15, 2);
        customerName : String(100);
    };
}
