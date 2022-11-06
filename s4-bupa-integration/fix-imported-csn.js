#!/usr/bin/env node

require('util').inspect.defaultOptions.depth = 11
const { readFileSync, writeFileSync } = require('fs')

const file = __dirname + '/bupa/API_BUSINESS_PARTNER.csn'

const csn = JSON.parse(readFileSync(file))
const { to_BusinessPartnerAddress } = csn.definitions['API_BUSINESS_PARTNER.A_BusinessPartner'].elements

to_BusinessPartnerAddress.on = [
  {
    "ref": [
      "to_BusinessPartnerAddress",
      "BusinessPartner"
    ]
  },
  "=",
  {
    "ref": [
      "BusinessPartner"
    ]
  }
]


delete to_BusinessPartnerAddress['@cds.ambiguous']
delete to_BusinessPartnerAddress.keys

writeFileSync(file, JSON.stringify(csn, null, 2))

console.log('Fixed in', file, { to_BusinessPartnerAddress })