# Hashchi - VRYNT

![](https://github.com/Rapid-learnings/grpc-nest-gql-seed/blob/master/readme%20assets/images/Logo%20-%20Horiztonal.jpeg)

## Description

##### How gRPC works?

In gRPC, there is gRPC server, gRPC client and protocol buffers.

- **Server** - The services implement an interface and run a gRPC server to handle client calls. Each server runs over a localhost connection with a port or a host domain.
- **Client** - Other applications that intend to use the functionalities provided by a gRPC server run a gRPC client which connects to the gRPC server and provides those methods or functionalities locally. Client takes the URL to the gRPC server to which it needs to connect.
- **Protocol buffers** - Protocol Buffer, a.k.a. Protobuf is the most commonly used IDL (Interface Definition Language) for gRPC. It's where you basically store your data and function contracts in the form of a proto file. We use .proto files for each microservice at both the client and server end. We have stored these files in \_proto folders for each module or application as required.

![](https://github.com/Rapid-learnings/grpc-nest-gql-seed/blob/master/readme%20assets/images/microservice-vrynt%20%20%231.png)

**For Example:**

#### User Microservice (gRPC Server)

User microservice works as a gRPC server and can be accessed by a gRPC client at localhost:6000.

_microservices\user-svc\src\main.ts_

```javascript
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: `${process.env.USER_SERVER_URL}:${process.env.USER_MSC_PORT}`, // localhost:6001
      package: "users",
      protoPath: join(__dirname, "./_proto/user.proto"), // path to protofile for user
      loader: {
        enums: String,
        objects: true,
        arrays: true,
        keepCase: true,
      },
      maxReceiveMessageLength:
        Number(process.env.GRPC_MAX_MESSAGE_SIZE_BYTES) || 21000000,
      maxSendMessageLength:
        Number(process.env.GRPC_MAX_MESSAGE_SIZE_BYTES) || 21000000,
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.listenAsync();
}
```

#### Api Gateway (gRPC Client)

User microservice works as a gRPC client and Connects with User microservice at localhost:6000.

_api-gateway\src\user\user-svc.options.ts_

```javascript
export const UserServiceClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    url: `${process.env.USER_SVC_URL}:${process.env.USER_SVC_PORT}`, // localhost:6000
    package: "users",
    protoPath: join(__dirname, "../_proto/user.proto"), // path to protofile for user
    loader: {
      enums: String,
      objects: true,
      arrays: true,
      keepCase: true,
    },
    maxReceiveMessageLength:
      Number(process.env.GRPC_MAX_MESSAGE_SIZE_BYTES) || 21000000,
    maxSendMessageLength:
      Number(process.env.GRPC_MAX_MESSAGE_SIZE_BYTES) || 21000000,
  },
};
```

Now, An instance of User Service can be created wherever we need to call any function from user service.

_api-gateway\src\user\user.controller.ts_

```javascript
  @Client(UserServiceClientOptions)
  private readonly userServiceClient: ClientGrpc;

  private userService: any;

  onModuleInit() {
    this.userService = this.userServiceClient.getService<any>('UserService');
  }
```

## Brief Architecture Overview

We have created microservices using nestjs [nestjs.com] and gRPC. We have following components in our solution -

- api-gateway (main entry point API for aggregating microservices)
- user-service (microservice)
- admin-service (microservice)

### Api Gateway

Api-gateway provides a common interface for all microservices.
It serves as a Rest API server and a GraphQL Server for the frontend client.

##### Features:

- It serves as a Rest API server.
- It serves as a GraphQL server.
- Performs Authentication and Authorization.
  This example uses (MongoDB) cluster as an instance for all microservices.

### Microservices

Microservices interact with the grpc client in the api gateway in order to
perform any specific functionality.

### User MicroService

User microservice is responsible for providing services for user profile management and authentication. It primarily interacts with the users collection of the database.

### Admin Microservice

Admin microservice is responsible for providing services for Admin Dashboard. transactions. It interacts with the dashboardvariables collection of the database.
This whole system uses a MongoDB Atlas as primary database.

### Scheduler Microservice

Scheduler microservice is an independent service. It is responsible for maintaining a Job queue used that can be used to schedule events which can trigger some kind of work like call a webhook or invoke a function. It uses a sorted set in Redis for implementing the Job queue. In our applications, it is used by collection microservice for scheduling collections for publishing, expiring auctions and auction offers for components and NFTs at a specific time.

- It uses a sorted set in Redis for implementing the Job queue.
- Runs a cron job every 10 seconds and triggers all events that should have been triggered.
- Creating new event triggers via webhook.

##### Get all items

```http
  POST /scheduler/create-event
```

| Parameter       | Type     | Description                                                    |
| :-------------- | :------- | :------------------------------------------------------------- |
| `scheduledDate` | `string` | **Required**. Date and Time in ISO string format               |
| `type`          | `string` | **Required**. A string to classify events for specific purpose |
| `id`            | `string` | **Required**. Unique id to call your webhooks with.            |

## Installation

### Api-gateway

1.  Now move into the "api-gateway" using cd api-gateway .
2.  Install all the dependencies using `npm install`.
3.  build the application using `npm run build`.
4.  Place the respective .env file if not already done.
5.  To run project in dev/watch mode run `npm run start:dev`
6.  To run project in prod mode run `npm run start:prod`

### Microservices

1. cd microservices
   - admin svc
   - user svc
   - scheduler svc
2. Now move into the respective "microservices" using cd microservices .
3. Now repeat step 1.2 for each microservice in "microservices" directory.
4. Place the respective .env file in every microservice if not already done.
5. build the application using `npm run build` for every microservice
6. to run project in dev/watch mode run `npm run start:dev` for every microservice
7. to run project in prod mode run `npm run start:prod` for every microservice

## Appendix

- Nest JS Docs - https://docs.nestjs.com/
- gRPC Proto file Docs - https://developers.google.com/protocol-buffers/docs/overview

## Authors

- [@sharshit15](https://www.github.com/sharshit15)
- [@Nayan-Shrivastava-RI](https://github.com/Nayan-Shrivastava-RI)
- [@amitrapidinnovation](https://www.github.com/amitrapidinnovation)
