@odata service CatalogService {

  // Triggers a SAP Build Process Automation workflow for order processing
  action triggerWorkflow(
    orderId  : String,
    orderNo  : String,
    amount   : Decimal,
    currency : String
  ) returns String;

} 
