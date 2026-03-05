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

    return super.init()
  }
}
