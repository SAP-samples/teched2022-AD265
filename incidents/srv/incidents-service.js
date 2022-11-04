module.exports = (async function() {

  const cds = require('@sap/cds');
  const S4bupa = await cds.connect.to('API_BUSINESS_PARTNER')

  // Delegate Value Help reads for Customers to S4 backend
  this.on('READ', 'Customers', (req) => {
    console.log('>> delegating to S4 service...')
    return S4bupa.run(req.query)
  })

  const db = await cds.connect.to('db')     // our primary database
  const { Customers }  = db.entities('s4.simple')  // CDS definition of the Customers entity

  this.after (['CREATE','UPDATE'], 'Incidents', async (data) => {
    const { customer_ID: ID } = data
    if (ID) {
      let replicated = await db.exists (Customers,ID)
      if (!replicated) { // initially replicate Customers info
        console.log ('>> Updating customer', ID)
        let customer = await S4bupa.read (Customers,ID)
        await INSERT(customer) .into (Customers)
      }
    }
  })

    // update cache if BusinessPartner has changed
  S4bupa.on('BusinessPartner.Changed', async ({ event, data }) => {
    console.log('<< received', event, data)
    const { BusinessPartner: ID } = data
    const customer = await S4bupa.read (Customers, ID)
    let exists = await db.exists (Customers,ID)
    if (exists)
      await UPDATE (Customers, ID) .with (customer)
    else
      await INSERT.into (Customers) .entries (customer)
  })


})