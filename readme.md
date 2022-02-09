# NestJs gRPC and GraphQL Seed

![](https://github.com/Rapid-learnings/grpc-nest-gql-seed/blob/master/readme%20assets/images/Logo%20-%20Horiztonal.jpeg)

## Description

### gRPC

gRPC is the concept of defining a service in terms of functions (methods) that can be called remotely. For each method, we define the parameters and return types. Services, parameters, and return types are defined in .proto files using Google's open source language-neutral protocol buffers mechanism.

- To start building gRPC-based microservices, we need to install the packages mentioned below:
  - npm i --save @grpc/grpc-js @grpc/proto-loader
    As other Nest microservices transport layer implementations, you select the gRPC transporter mechanism using the transport property of the options object passed to the createMicroservice() method.
    In the following example, we'll set up a microservice.
    The options property provides metadata about that service; its properties are described below.

#### Creating Microservice

_microservices\microservicename-svc\src\main.ts_

```javascript
async function() {
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.GRPC,
  options: {
    url: 'localhost:6600',
    package: 'microservicename',
    protoPath: join(__dirname, 'microservicename/microservicename.proto'),
  },
});
}
```

#### Options

- **Package** - Protobuf package name (matches package setting from .proto file). Required
- **ProtoPath** - Absolute (or relative to the root dir) path to the .proto file. Required
- **Url** - Connection url. String in the format ip address/dns name:port (for example, 'localhost:50051') defining the address/port on which the transporter establishes a connection. Optional. Defaults to 'localhost:5000'
- **ProtoLoader** - NPM package name for the utility to load .proto files. Optional.Defaults to '@grpc/proto-loader'
- **Loader** - @grpc/proto-loader options. These provide detailed control over the behavior of .proto files.
- **Credentials** - Server credentials.

### How gRPC works?

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

For more detailed information, visit https://docs.nestjs.com/microservices/grpc.

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

##### Create Event

```http
  POST /scheduler/create-event
```

| Parameter       | Type     | Description                                                    |
| :-------------- | :------- | :------------------------------------------------------------- |
| `scheduledDate` | `string` | **Required**. Date and Time in ISO string format               |
| `type`          | `string` | **Required**. A string to classify events for specific purpose |
| `id`            | `string` | **Required**. Unique id to call your webhooks with.            |



### API Reference
#### User Object
| Field name     |  Field Type  |
| :------------- | :----------  |
| first_name     |   string     |
| last_name      |   string     |
| email          |   string     |
| username       |   string     |
| password       |   string     |
| isEmailVerfied |   boolean    |
| appleId        |   string     |
| twoFactorAuth  |   boolean    |
| role           |   string     |
| status         |   string     |
| socialDiscord   |   string     |
| socialTelegram |   string     |
| socialTwitter  |   string     |
| socailInstagram|   string     |
| socailYoutube  |   string     |
| socialTiktok   |   string     |
| socialTwitch   |   string     |
| mobile         |   string     |
| profileImageUrl|   string     |
| _id            |   string     |
| createdAt      |   string     |
| updatedAt      |   string     |
| isProfileUpdated |  boolean   |
| isBlocked      |   boolean    |
| stripe_account_id| string     |
| kyc_status     |   string     |
| kyc_applicant_id | string     |

#### REST-APIs
| Name                      | Type     | Description                    | Payload                                                 | Response         |
| :------------------------ | :------- | :----------------------------- | :------------                                           | :-------------   |
| `login`                   | Mutation | to login a user                | emailorUsername: string, password: string               | User, refreshToken, Token, message, expiresIn   |
| `listUsers`               | Query    | to fetch list of users         | userId: string, sortBy: string, sortOrder: number, limit: number, offset: number, status: string, isBlocked: boolean, mobile: string, username: string, email: string, name: string, isEmailVerfied: boolean, isProfileUpdated: boolean, twoFactorAuth: boolean, role: string, | totaluser:int, User[]  |
| `updateUser`              | Mutation | to update user                 | isBlocked: boolean, first_name: string, last_name: string, email: string, username: string, socialTelegram: string, socialDiscord: string, profileImageUrl: string, status: string | User, message: string      |
| `createUser`              | Mutation | to create users                | email: string, username: string, first_name: string, last_name: string, password: string |User, refreshToken, Token, message, expiresIn  |
| `register-captcha`        | Mutation | to register captcha            | N/A   | message: captcha-registered created      |
| `health`                  | Query    | to test functioning of specific api's | N/A |  message: string |
| `findOneByEmailOrUsername`| Mutation | to fetch user via email or username | email: string, username: string | User |
| `updateProfile`           | Mutation | to update profile of an user   | isBlocked: boolean, currentPassword: string, newPassword: string, first_name: string, last_name: string, username: string, socialTelegram: string, socialDiscord: string, socialTwitter: string, socailInstagram: string, socailYoutube: string, socialTiktok: string, socialTwitch: string, mobile: string, twoFactorAuth: string, status: string| message: profile updated   |

#### GraphQl-API's
| Name                       | Type       | Description                       | Payload         | Response           |
| :------------------------- | :--------- | :-------------------------------  | :------         | :-------           |
| `login`                    | Mutation   | to login a user                   | emailorUsername: string, password: string  | User, refreshToken, Token, message, expiresIn |
| `listUsers`                | Query      | to fetch list of users            | userId: string, sortBy: string, sortOrder: number, limit: number, offset: number, status: string, isBlocked: boolean, mobile: string, username: string, email: string, name: string, isEmailVerfied: boolean, isProfileUpdated: boolean, twoFactorAuth: boolean, role: string, | totaluser: int, user [] |
| `updateUser`    | Mutation   | to update user                    | isBlocked: boolean, first_name: string, last_name: string, email: string, username: string, socialTelegram: string, socialDiscord: string, profileImageUrl: string, status: string | message: user updated      |
| `createUser`               | Mutation   | to create users                   | email: string, username: string, first_name: string, last_name: string, password: string | User, refreshToken, Token, message, expiresIn    |
| `uploadUserProfilePicture` | Mutation   | to upload user profile picture    | imageUrl: string| message: profile picture updated               |
| `updateProfile`            | Mutation   | to update profile of an user      | isBlocked: boolean, currentPassword: string, newPassword: string, first_name: string, last_name: string, username: string, socialTelegram: string, socialDiscord: string, socialTwitter: string, socailInstagram: string, socailYoutube: string, socialTiktok: string, socialTwitch: string, mobile: string, twoFactorAuth: string, status: string| message: profile updated   |
| `getBalance`               | Query      | to fetch balance of an user       | N/A             | amount: float, assetCode: string   |
| `getUserById`              | Query      | to fetch user by userId           | userId: string  | User           |
| `getUsersByFilters`        | Query      | to fetch filtered users           | userId: string, sortBy: string, sortOrder: number, limit: number, offset: number, status: string, isBlocked: boolean, mobile: string, username: string, email: string, name: string, role: string | totalusers: int, Users[]  |
| `createCharge`             | Mutation   | to create charge                  | id: string, chargeName: string, chargeDescription: string, pricingType: string, kind: string, amount: string, fee: string, assetCode: string, from: string, platform: string, createdAt: string  | message: charge created  |
| `createStripeAccount`      | Mutation   | to create Stripe Account          | returnUrl: string | message: string, accountLink: string |
| `createPaymentIntent`      | Mutation   | to create Payement Intent         | amount: string    | client secret: string     |
| `checkBalance`             | Query      | to check Balance                  | assetCode: string|  amount: float, withheldAmount: string, assetCode: string  |
| `topUpWallet`              | Mutation   | to topup wallet                   | paymentMethod: string, amount: string | client_secret: String , coinbase_charge_url: String, transactionId :String, message: String  |
| `topUpWalletConfirm`       | Mutation   | to confirm if wallet is topped up | paymentMethod: string, transactionId: string, transactionHash: string | message: topup done confirmed  |
| `listTransactions`         | Mutation   | to list transactions              | kind: string, sortBy: string, sortOrder: number, limit: number, offset: number, type: string, status: string, assetCode: string, refunded: string, platform: string| totalTransaction: int, transactions |
| `twoFactorOtp`            | Mutation | to login using emailId or otp  | email: string, otp: string                              | forTask, message, expiresIn |
| `twoFactorVerify`         | Mutation | to verify two factor           | email: string, otp: string                              | User, refreshToken, Token, message, expiresIn  |
| `googleLogin`             | Mutation | to login using google          | email, first_name, last_name, name, imageUrl, accessToken| User, refreshToken, Token, message, expiresIn |
| `appleLogin`              | Mutation | to login using apple id        | code: string, id_token: string                          |User, refreshToken, Token, message, expiresIn|
| `appleRefreshToken`       | Mutation | to refresh apple token         | refreshToken: string       |  refreshToken, Token, message, expiresIn    |
| `sendEmailOtp`            | Query    | send otp to the email id       | email: string                                           |  forTask, message, expiresIn             |
| `verifyEmailOtp`          | Mutation | to verify email via otp        | email: string, otp: string                              | User, Token, message, expiresIn             |
| `forgotPasswordOtp`       | Mutation | sends otp to the email id      | email: string, otp: string, password: string            | forTask, message, expiresIn    |
| `getLoggedInUser`         | Query    | to fetch logged in users       | first_name: string, last_name: string, email: string, username: string, password: string, isEmailVerfied: boolean, appleId: string, twoFactorAuth: boolean, role: string, status: string, socialDiscord: string, socialTelegram: string, socialTwitter: string, socailInstagram: string, socailYoutube: string, socialTiktok: string, socialTwitch: string, mobile: string, profileImageUrl: string, _id: string, createdAt: string, updatedAt: string, isBlocked: boolean, stripe_account_id: string, kyc_status: string, kyc_applicant_id: string, | User  |
| `resetPassword`           | Mutation | to reset password              | current password: string, new password: string          | message: string            |
| `forgotPassword`          | Mutation | to reset password              | email: string, otp: string, password: string            | message: string          |
| `checkEmail`              | Mutation | to verify the email            | userId: string, newEmail: string                        | message: string   |
| `checkUsername`           | Mutation | to verify the username         | username: string    | message: string|



### Environment variables

| Name                          | Description                                      |
| :---------------------------- | :----------------------------------------------- |
| `PORT`                        | Port to API gateway                              |
| `BASE_URL`                    | Base URL to Api Gatewat                          |
| `DB_URL`                      | URL to MongoDB                                   |
| `PASSWORD`                    | to create users                                  |
| `USER_SVC_URL`                | domain to user microservice                      |
| `USER_SVC_PORT`               | port to user microservice                        |
| `USER_MSC_PORT`               | port to user microservice                        |
| `USER_SERVER_URL`             | domain to user microservice                      |
| `ADMIN_MSC_PORT`              | port to admin microservice                       |
| `ADMIN_SERVER_URL`            | domain to admin microservice                     |
| `WALLET_SVC_PORT`             | port to wallet microservice                      |
| `WALLET_SVC_URL`              | domain to wallet microservice                    |
| `ADMIN_EMAIL`                 | default admin email                              |
| `ADMIN_USERNAME`              | default admin username                           |
| `ADMIN_PASSWORD`              | default admin password                           |
| `ADMIN_FIRST_NAME`            | default admin first name                         |
| `ADMIN_LAST_NAME`             | default admin last name                          |
| `GRPC_MAX_MESSAGE_SIZE_BYTES` | maximum grpc message size                        |
| `SENTRY_DSN`                  | DSN to sentry account                            |
| `APPLE_CLIENT_ID`             | Apple Auth client id                             |
| `APPLE_REDIRECT_URL`          | Apple Auth - redirect webhook URL to verify auth |
| `APPLE_TEAM_ID`               | Apple Auth team id                               |
| `APPLE_KEY_IDENTIFIER`        | Apple Auth key id                                |
| `APPLE_RSA_KEY_NAME`          | Apple Auth RSA file name .p8                     |
| `JWT_SECRET_KEY`              | JWT secret                                       |
| `AWS_S3_ACCESS_KEY`           | AWS account access key                           |
| `AWS_S3_KEY_SECRET`           | AWS account secret key                           |
| `AWS_S3_BUCKET`               | AWS S3 bucket name                               |
| `ONFIDO_API_TOKEN`            | API token for ONFIDO KYC                         |
| `CREATE_CHARGE_URL`           | coinbase create Charge API URL                   |
| `COINBASE_API_KEY`            | coinbase commerce API Token                      |
| `COINBASE_WEBHOOK_SECRET`     | coinbase commerce Auth Secret                    |
| `SENDGRID_API_KEY`            | Sendgrid API Token                               |
| `STRIPE_PUBLISHABLE_KEY`      | Stripe connect publishable key                   |
| `STRIPE_SECRET_KEY`           | Stripe connect secret key                        |
| `REDIS_URL`                   | URL to Redis DB                                  |
| `SCHEDULER_MSC_PORT`          | Port to Scheduler microservice                   |
| `GEETEST_ID`                  | Geetest account id                               |
| `GEETEST_KEY`                 | Geetest account API Token for catcha v3          |

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
5. build the application using `npm run build` for every microservice.
6. to run project in dev/watch mode run `npm run start:dev` for every microservice.
7. to run project in prod mode run `npm run start:prod` for every microservice.

### Third Party Services

- Authentication - Apple and Google SSO.
- KYC - Onfido
- Captcha - Geetest
- Emails - Sendgrid
- Stripe
- coinbase commerce
- AWS S3

## Appendix

- Nest JS Docs - https://docs.nestjs.com/
- gRPC Proto file Docs - https://developers.google.com/protocol-buffers/docs/overview

## Authors

- [@sharshit15](https://www.github.com/sharshit15)
- [@Nayan-Shrivastava-RI](https://github.com/Nayan-Shrivastava-RI)
- [@amitrapidinnovation](https://www.github.com/amitrapidinnovation)
