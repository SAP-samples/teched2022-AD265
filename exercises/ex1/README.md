# Exercise 1 - Integrate a Service from SAP S/4HANA Cloud

In this exercise, we will integrate the _Business Partner Service_ from SAP S/4HANA Cloud into the _Incidents Management_ application.

## Import the service definition

## Add sample data

## Run with service mocks

## Write the CDS code

<details open>
<summary>See the solution</summary>

```cds
using { API_BUSINESS_PARTNER as S4 } from './external/API_BUSINESS_PARTNER';
...
```
</details>

## Write the handler code

<details open>
<summary>See the solution</summary>

```js
// Connect to services we want to mashup below...
const S4bupa = await cds.connect.to('API_BUSINESS_PARTNER')   //> external S4 service
const admin = await cds.connect.to('AdminService')            //> local domain service
const db = await cds.connect.to('db')                         //> our primary database
...
```
</details>

## Integrate events

## Connect to remote SAP S/4HANA system



## Summary

You've now learned how to integrate a remote service step by step.

In the next [exercise 2](../ex2/README.md), you will package this implementation such that it could be used as an integration package by other applications.
