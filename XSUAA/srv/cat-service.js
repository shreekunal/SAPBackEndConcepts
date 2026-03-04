const cds = require('@sap/cds')

module.exports = class CatalogService extends cds.ApplicationService {
  init() {

    const { Books } = cds.entities('CatalogService')

    this.before(['CREATE', 'UPDATE'], Books, async (req) => {
      console.log('Before CREATE/UPDATE Books', req.data)
    })
    this.after('READ', Books, async (books, req) => {
      console.log('After READ Books', books)
    })

    this.on('securityAction', async (req) => {
      const scopes = {
        Read: req.user.is('Read'),
        Create: req.user.is('Create'),
        Delete: req.user.is('Delete'),
        Update: req.user.is('Update'),
        Display: req.user.is('Display'),
      }
      console.log('User:', JSON.stringify(req.user))
      console.log('Scopes:', JSON.stringify(scopes))
      return JSON.stringify(scopes)
    })


    return super.init()
  }
}
