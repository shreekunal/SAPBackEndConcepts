const cds = require('@sap/cds')
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client')

module.exports = class CatalogService extends cds.ApplicationService {
  async init() {

    // =======================
    // TRIGGER BPA WORKFLOW
    // =======================
    this.on('triggerWorkflow', async (req) => {
      const { orderId, orderNo, amount, currency } = req.data

      if (!orderId) {
        return req.error(400, 'orderId is required')
      }

      // Save order to DB with PENDING status before triggering BPA
      const { Orders } = cds.entities('CatalogService')
      const db = await cds.connect.to('db')
      await db.run(
        UPSERT.into(Orders).entries({
          ID: parseInt(orderId),
          OrderNo: orderNo || '',
          Amount: parseFloat(amount) || 0,
          Currency: currency || 'USD',
          Status: 'PENDING'
        })
      )
      console.log(`Order ${orderId} saved to DB with status PENDING`)

      const oPayload = {
        definitionId: 'us10.058e1c82trial.salesordersmanagement.orderProcessing',
        context: {
          id: parseInt(orderId) || 0,
          orderno: orderNo || '',
          amount: parseFloat(amount) || 0,
          currency: currency || '',
          status: 'Initiated'
        }
      }

      console.log('Triggering BPA Workflow with payload:', JSON.stringify(oPayload, null, 2))

      try {
        const response = await executeHttpRequest(
          { destinationName: 'spa_process_destination' },
          {
            method: 'POST',
            url: '/',
            data: oPayload,
            headers: { 'Content-Type': 'application/json' },
            fetchCsrfToken: false
          }
        )

        console.log('Workflow triggered successfully. Instance ID:', response.data?.id)
        return response.data?.id
      } catch (error) {
        console.error('Error triggering workflow:', error.response?.data || error.message)
        return req.error(500, `Failed to trigger workflow: ${error.message}`)
      }
    })

    // =======================
    // UPDATE ORDER STATUS
    // Called by SAP BPA Service Task after Approve decision
    // POST /odata/v4/catalog/updateOrderStatus
    // Body: { "orderId": <integer> }
    // =======================
    this.on('updateOrderStatus', async (req) => {
      console.log('req.data    :', JSON.stringify(req.data))
      console.log('req.params  :', JSON.stringify(req.params))

      const orderId = req.data?.orderId ?? req.data?.id ?? req.params?.[0]?.orderId

      if (!orderId && orderId !== 0) {
        console.warn('No orderId found in the request')
        return 'No orderId received'
      }

      console.log(`Updating Order ${orderId} → status: APPROVED`)

      const { Orders } = cds.entities('CatalogService')
      const db = await cds.connect.to('db')

      const updated = await db.run(
        UPDATE(Orders)
          .set({ Status: 'APPROVED' })
          .where({ ID: orderId })  // already an integer, no parseInt needed
      )

      if (!updated) {
        return req.error(404, `Order ${orderId} not found`)
      }

      console.log(`Order ${orderId} status updated to APPROVED`)
      return `Order ${orderId} status updated to APPROVED`
    })

    return super.init()
  }
}
