using {my.orders} from '../db/schema';

@odata
service CatalogService {

  // Expose Orders table (BPA will update status here)
  entity Orders as projection on orders.Orders;

  // Triggers a SAP Build Process Automation workflow for order processing
  action triggerWorkflow(orderId: String, orderNo: String, amount: Decimal, currency: String)   returns String;

  // Called by SAP BPA Service Task after approval
  action updateOrderStatus(orderId: Integer) returns String;

}
