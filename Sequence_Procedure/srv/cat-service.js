const cds = require('@sap/cds')

module.exports = class SalesService extends cds.ApplicationService {
  async init() {

    const { Customers, SalesOrders, SalesOrderItems } = cds.entities('sales')

    // Handle createOrder action
    this.on('createOrder', async (req) => {
      const { customerId, orderDate, items } = req.data

      // Get next sequence value
      const db = await cds.connect.to('db')
      const result = await db.run(
        `SELECT ORDER_NO_SEQUENCE.NEXTVAL FROM DUMMY`
      )
      const nextVal = result[0]['ORDER_NO_SEQUENCE.NEXTVAL']
      const orderNo = `ORD-${String(nextVal).padStart(7, '0')}`

      // Calculate item totals and order total
      let totalAmount = 0
      const orderItems = items.map(item => {
        const itemTotal = item.quantity * item.price
        totalAmount += itemTotal
        return {
          ...item,
          itemTotal
        }
      })

      // Create the order
      const order = await INSERT.into(SalesOrders).entries({
        orderNo,
        orderDate,
        status: 'NEW',
        totalAmount,
        customer_ID: customerId,
        items: orderItems
      })

      return order
    })

    return super.init()
  }
}