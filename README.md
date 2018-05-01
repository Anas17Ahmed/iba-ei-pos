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

Or [download Hunts Point POS here](https://github.com/Anas17Ahmed/iba-ei-pos.git).

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

## Planned Features
- [ ] pos integration
- [ ] search on inventory page
- [ ] inventory increment page
- [ ] account for multiple cash registers
- [ ] clean & beautiful interface

## Integration Patterns Covered
### Messaging Systems
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
