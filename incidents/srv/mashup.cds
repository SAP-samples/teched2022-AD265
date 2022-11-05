using { acme.incmgt, IncidentsService } from './incidents-service';
using { s4 } from 's4-bupa-integration/bupa';

extend incmgt.Incidents with {
  customer : Association to s4.simple.Customers;
}

extend service IncidentsService with {
  @readonly entity Customers as projection on s4.simple.Customers;
  @readonly entity CustomerAddress as projection on s4.simple.CustomerAddress;
}

extend projection IncidentsService.Incidents  {
  customerAddress: Association to s4.simple.CustomerAddress on customerAddress.bupaID = customer.ID
}

annotate s4.simple.Customers with @cds.persistence: {table,skip:false};
annotate s4.simple.CustomerAddresses with @cds.persistence: {table,skip:false};

// --- Fiori annotations
using from '../app/fiori';

annotate IncidentsService.Incidents with @(
  UI: {
    // insert table column
    LineItem : [
      ...up to {Value: title},
      { Value: customer.name, Label: 'Customer' },
      ...
    ],
    // insert customer to field group
    FieldGroup #GeneralInformation : {
      Data: [
        { Value: customer_ID, Label: 'Customer'},
        { Label: 'Address', $Type  : 'UI.DataFieldForAnnotation', Target : 'customerAddress/@Communication.Contact' },
        ...,
      ]
    },
  }
);

// show customer name first (before ID)
annotate IncidentsService.Incidents:customer with @Common: {
  Text:customer.name,
  TextArrangement: #TextFirst
};
