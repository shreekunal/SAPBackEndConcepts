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

    // Handle getOrderTotal action - calls HANA stored procedure
    this.on('getOrderTotal', async (req) => {
      const { ID } = req.data

      const db = await cds.connect.to('db')
      const result = await db.run(
        `CALL GET_ORDER_TOTAL('${ID}', ?)`
      )

      // HANA TABLE OUT returns as result.ET_RESULT[0].TOTAL
      const total = result?.ET_RESULT?.[0]?.TOTAL ?? 0.00
      return parseFloat(total)
    })

    // Level 2: Get aggregated order stats for a customer
    this.on('getCustomerSummary', async (req) => {
      const { customerId } = req.data

      const db = await cds.connect.to('db')
      const result = await db.run(
        `CALL GET_CUSTOMER_SUMMARY('${customerId}', ?)`
      )

      const row = result?.ET_RESULT?.[0]
      return {
        customerName: row?.CUSTOMER_NAME ?? null,
        totalOrders: parseInt(row?.TOTAL_ORDERS ?? 0),
        totalSpent: parseFloat(row?.TOTAL_SPENT ?? 0),
        avgOrderValue: parseFloat(row?.AVG_ORDER_VALUE ?? 0),
        lastOrderDate: row?.LAST_ORDER_DATE ?? null
      }
    })

    // Level 3: Update order status with business rule validation
    this.on('updateOrderStatus', async (req) => {
      const { orderID, newStatus } = req.data

      const db = await cds.connect.to('db')
      const result = await db.run(
        `CALL UPDATE_ORDER_STATUS('${orderID}', '${newStatus}', ?)`
      )

      const row = result?.ET_RESULT?.[0]
      return {
        success: row?.SUCCESS ?? 'false',
        message: row?.MESSAGE ?? 'Unknown error',
        oldStatus: row?.OLD_STATUS ?? null,
        newStatus: row?.NEW_STATUS ?? null
      }
    })

    // Level 4: Get top N products ranked by total revenue
    this.on('getTopProducts', async (req) => {
      const { topN } = req.data

      const db = await cds.connect.to('db')
      const result = await db.run(
        `CALL GET_TOP_PRODUCTS(${topN}, ?)`
      )

      return (result?.ET_RESULT ?? []).map(row => ({
        rank: parseInt(row.RANK),
        productName: row.PRODUCT_NAME,
        totalQty: parseInt(row.TOTAL_QTY),
        totalRevenue: parseFloat(row.TOTAL_REVENUE),
        orderCount: parseInt(row.ORDER_COUNT),
        avgPrice: parseFloat(row.AVG_PRICE)
      }))
    })

    // Table Function: get orders filtered by status
    // Called with SELECT * FROM FUNCTION (unlike CALL for procedures)
    this.on('getOrdersByStatus', async (req) => {
      const { status } = req.data

      const db = await cds.connect.to('db')
      const result = await db.run(
        `SELECT * FROM GET_ORDERS_BY_STATUS('${status}')`
      )

      return result.map(row => ({
        orderId     : row.ORDER_ID,
        orderNo     : row.ORDER_NO,
        orderDate   : row.ORDER_DATE,
        status      : row.STATUS,
        totalAmount : parseFloat(row.TOTAL_AMOUNT),
        customerName: row.CUSTOMER_NAME
      }))
    })

    return super.init()
  }
}