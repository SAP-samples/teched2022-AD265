# Exercise 2 - Use a Prebuilt Integration Package

In this exercise, you will see how an integration package can be embedded into an application.

## Install

```sh
npm install cds-integration-demo
```

### What's Inside

Let's see what got installed by expanding the folder `node_modules/cds-integration-demo`:

```
node_modules/cds-integration-demo
├── LICENSE
├── README.md
├── package.json
└── s4
    └── bupa
        ├── API_BUSINESS_PARTNER.csn
        ├── API_BUSINESS_PARTNER.js
        ├── data
        │   └── API_BUSINESS_PARTNER-A_BusinessPartner.csv
        └── index.cds
```

Compare this with the `srv/external` folder, and you can see that this is pretty much the same content:
- `API_BUSINESS_PARTNER.csn`: the CDS model that you imported with `cds import`
- `API_BUSINESS_PARTNER.js`: a bit of glue code as 'implementation' when the service is mocked
- `data/...`: sample data
- `index.cds`: Contains additional cds code for events, which we will see later.  Also acts as 'main' file to allow shorter import paths.

## Adjust Application

1. Replace the `using '.../API_BUSINESS_PARTNER'` line in `srv/mashup.cds` with
    ```cds
    using { API_BUSINESS_PARTNER as S4 } from 'cds-integration-demo/s4/bupa';
    ```

    Note the path difference for node packages, which does not start with `./` (unlike the path import `./srv/...`).<br>
    The `/s4/bupa` path is actually `/s4/bupa/index.cds`, but this way, it's much crisper.

2. Remove folder `srv/external`.

### Verify

The application runs as before, both in mock mode:

```sh
cds watch
```

and when connected to the sandbox of SAP API Business Hub:

```sh
cds watch --profile sandbox
```

## Use events to update cache data

We haven't dicussed yet how to update the cache table holding the `Customers` data.  Events will inform our application whenever the remote BusinessPartner has changed.<br>
Let's see what we need to do and where the integration package already helps us.

### Event definitions
Go to `node_modules/cds-integration-demo/s4/bupa/index.cds` (you can also navigate from the first line in `mashup.cds` using <kbd>Ctrl+Click</kbd>).

You can see how it adds an event definition to the BusinessPartnerService:

```cds
extend service S4 {
  event BusinessPartner.Changed @(type: 'sap.s4.beh.businesspartner.v1.BusinessPartner.Changed.v1') {
    BusinessPartner: S4.A_BusinessPartner:BusinessPartner;
  }
}
```

This allows [CAP's advanced support for events and messaging](https://cap.cloud.sap/docs/guides/messaging) to kick in, e.g. to automatically emit to and subscribe to events from message brokers behind the scenes.

Also, the event name `BusinessPartner.Changed` is semantically closer to the domain and easier to read than the underlying technical event `sap.s4.beh.businesspartner.v1.BusinessPartner.Changed.v1`, which can be found at [SAP API Business Hub](https://api.sap.com/event/CE_BUSINESSPARTNEREVENTS/resource).  As of now, synchronous and asynchronous APIs from SAP S/4HANA sources are not correlated in one place there.

### Emit events locally

As we don't have [SAP Event Mesh](https://cap.cloud.sap/docs/guides/messaging/#using-sap-event-mesh) running locally, it would be great if something could emit events when testing.  Luckily, the package has support for this scenario in file `node_modules/cds-integration-demo/s4/bupa/API_BUSINESS_PARTNER.js`:

```js
this.after('UPDATE', A_BusinessPartner, async data => {
  const event = { BusinessPartner: data.BusinessPartner }
  console.log('>> BusinessPartner.Changed', event)
  await this.emit('BusinessPartner.Changed', event);
});
```

This means whenever you change data through the `API_BUSINESS_PARTNER` mock service, a local event is emitted.
Also note how the event name `BusinessPartner.Changed` matches to the event definition from the CDS code above.

### React to events

To close the loop, we only need to react in the application.

In `srv/incidents-service.js`, add this code block:

```js
// update cache if BusinessPartner has changed
S4bupa.on('BusinessPartner.Changed', async ({ event, data }) => {
    console.log('<< received', event, data)
    const { BusinessPartner: ID } = data
    const customer = await S4bupa.read (Customers, ID)
    await UPDATE (Customers, ID) .with (customer)
})
```

### Put it all together

Start the application with mocks:
```
cds watch
````

and change one of our cached customers `Z100001` (again, in an `.http` file)

```
###
PUT http://localhost:4004/api-business-partner/A_BusinessPartner/Z100001
Authorization: Basic carol:
Content-Type: application/json

{
  "BusinessPartnerFullName": "Albus Percival Wulfric Brian Dumbledore"
}
```

You should see both the event being emitted as well as received:

```
>> BusinessPartner.Changed { BusinessPartner: 'Z100001' }
<< received BusinessPartner.Changed { BusinessPartner: 'Z100001' }
```

The UI also reflects the changed data:

![Updated customer list](assets/updated-customer.png)

## Summary

You've now learned how to add an integration package.  You've also seen that quite some application code became obsolete and could be removed:
- The imported `edmx` file and the resulting `csn` file
- The `js` mock implementation and sample data

And that additional features can be added in such packages, like
- Event definitions
- Event emitters for local testing
- CDS projections for model parts that are often used, like the `Customers` definition.
