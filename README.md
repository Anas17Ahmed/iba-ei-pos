# POS

A simple, beautiful, & real-time Point of Sale system written in Node.js & Angular.js

# Quick Start

To start using pos:

## Step 1: Get code

Install Node.js

Clone repo via git 
```bash
https://github.com/Anas17Ahmed/iba-ei-pos.git
```

Or [download POS here](https://github.com/Anas17Ahmed/iba-ei-pos.git).

## Step 2: Install Dependencies

Go to the POS directory and run:

```bash
$ npm install
$ sudo npm install -g bower
$ bower install
```

## Step 3: Run the app!

To start the messaging systen, run:

```bash
node server/server.js //localhost:80
```

To start the inventory app, run:

```bash
node server/inventory //localhost:81
```

To start the order app, run:

```bash
node server/pos //localhost:82
```

To start the transaction app, run:

```bash
node server/transaction //localhost:83
```

This will install all dependencies required to run the node app.

# Project Goals

## Tools
- Node.js
- Git bash
- Sublime text
- AWS SQS
- AWS SNS

### Amazon SNS Pub/Sub Messaging
![Decouple and scale microservices, distributed systems, and serverless applications](https://docs.aws.amazon.com/sns/latest/dg/images/sns-mobile-subscribe.png)
Amazon SNS is a fully managed pub/sub messaging service that makes it easy to decouple and scale microservices, distributed systems, and serverless applications. With SNS, you can use topics to decouple message publishers from subscribers, fan-out messages to multiple recipients at once, and eliminate polling in your applications. SNS supports a variety of subscription types, allowing you to push messages directly to Amazon Simple Queue Service (SQS) queues, AWS Lambda functions, and HTTP endpoints. AWS services, such as Amazon EC2, Amazon S3 and Amazon CloudWatch, can publish messages to your SNS topics to trigger event-driven computing and workflows. SNS works with SQS to provide a powerful messaging solution for building cloud applications that are fault tolerant and easy to scale.


### Amazon Simple Queue Service (SQS)
![Fully managed message queues for microservices, distributed systems, and serverless applications](http://fbrnc.net/user/pages/01.blog/2016/03/02.messaging-on-aws/sqs.png)
Amazon Simple Queue Service (SQS) is a fully managed message queuing service that makes it easy to decouple and scale microservices, distributed systems, and serverless applications. Building applications from individual components that each perform a discrete function improves scalability and reliability, and is best practice design for modern applications. SQS makes it simple and cost-effective to decouple and coordinate the components of a cloud application. Using SQS, you can send, store, and receive messages between software components at any volume, without losing messages or requiring other services to be always available.

## Architecture
##### POS Messaging System
![UML](https://github.com/Anas17Ahmed/iba-ei-pos/blob/master/AWS%20MS%20POS%20Architecture.png)

##### AWS SQS Message producer and consumer on message channel
![UML](https://github.com/Anas17Ahmed/iba-ei-pos/blob/master/aws_sqs_message_consumers1.png)

##### Multicasting
![UML](https://github.com/Anas17Ahmed/iba-ei-pos/blob/master/aws_message_multicasts2.png)

## Planned Features
- [ ] pos integration
- [ ] search on inventory page
- [ ] inventory increment page
- [ ] account for multiple cash registers
- [ ] clean & beautiful interface

## Integration Patterns Covered
### Messaging Systems ( AWS SQS & SNS )
- Message Channel ( Inventory, Transaction )
- Message Pipes
- Message Routing ( Content Based )
- Message Endpoint ( Topic, Inventory, Transaction and common messaging queue )

### Messaging Channels
- Point-to-Point Channel
- Publish-Subscribe Channel
- Invalid Message Channel
- Dead Letter Channel

## Scanarios
### Message Channel
Connect the Inventory and order applications using a Inventory Channel, where inventory application writes new inventory to the channel and the order systems reads that inventory information from the inventory channel.

### Message Pipes
Subscribe different queues on the inventory topic, add message pipes on each subscription on this topic. If the message published to a topic that contain inventory header, then only inventory channel receives this message.

### Message Endpoint
Create inventory endpoint to send/receive inventories
Create transactions endpoint to send/receive transactions

### Message Routing ( Content Based )
If inventory message sent to common messaging queue then messaging system check the header of the message then route this message to right endpoint. 

### Point-to-Point Channel
Send the message on a Transaction Channel, which ensures that only transaction system will receive a particular message.

### Publish-Subscribe Channel
If inventory manager create new inventory and publish it to the topic then all the order management system will notify about that inventory that has been added.

### Invalid Message Channel
Inventory message sends to transaction system then it will be moved to invalid message queue

### Dead Letter Channel
If the order is checkout from order management system, but the transaction is down, then transaction message goes to dead letter message queue. 

# Screenshots
Manage Inventory
![Inventory page screenshot](https://raw.githubusercontent.com/afaqurk/screenshots/master/hunts-point-pos/inventory.png)

Inventory - Edit Product
![Inventory item view](https://raw.githubusercontent.com/afaqurk/screenshots/master/hunts-point-pos/item.png)

Live Cart (Updates in real-time)
![Live Cart screenshot](https://raw.githubusercontent.com/afaqurk/screenshots/master/hunts-point-pos/live-cart.png)

POS 1
![](https://raw.githubusercontent.com/afaqurk/screenshots/master/hunts-point-pos/checkout-screen.png)

POS 2
![](https://raw.githubusercontent.com/afaqurk/screenshots/master/hunts-point-pos/checkout-modal.png)

Transactions
![](https://raw.githubusercontent.com/afaqurk/screenshots/master/hunts-point-pos/transactions.png)
