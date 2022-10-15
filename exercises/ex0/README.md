# Getting Started

In the following we describe how to get started with the _Incidents Management_ application, which we use throughout the session and the exercises.

## Open SAP Business Application Studio

Open this URL for SAP Business Application Studio in the account prepared for the SAP TechEd session.
Use the credentials provided by your instructor.


## Clone and Install the Project

```sh
git clone https://github.com/SAP-samples/teched2022-AD265 -b initial

npm install
```

## Run Locally

```sh
cd teched2022-AD265

cds watch
```

Open http://carol@localhost:4004/

Go to [`Incidents → Fiori preview`](http://carol@localhost:4004/$fiori-preview/IncidentsService/Incidents#preview-app), which opens a SAP Fiori elements list page for the `Incidents` entity.

> Note the `carol@` string in the URL, which logs you in with user local mock `carol`.

## Summary

Now that you have a first version of the application running, continue to [Exercise 1 - Integrate a service from SAP S/4HANA Cloud](../ex1/README.md).
