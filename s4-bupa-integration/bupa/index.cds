using { API_BUSINESS_PARTNER as S4 } from './API_BUSINESS_PARTNER';

namespace s4.simple;

extend service S4 {
  event BusinessPartner.Changed @(type: 'sap.s4.beh.businesspartner.v1.BusinessPartner.Changed.v1') {
    BusinessPartner: S4.A_BusinessPartner:BusinessPartner;
  }
}

entity Customers as projection on S4.A_BusinessPartner {
  key BusinessPartner as ID,
  BusinessPartnerFullName as name
}

// Customers value help
annotate Customers with @UI.Identification : [{Value:name}];
annotate Customers with @cds.odata.valuelist;
annotate Customers with {
  ID   @title : 'Customer ID';
  name @title : 'Customer Name';
}
