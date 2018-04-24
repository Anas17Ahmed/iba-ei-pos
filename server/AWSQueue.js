'use strict';

/**
 * @author anas17ahmed.
 *
 * @file Module for working with AWS SQS Queue.
 */
var Promise = require( 'bluebird' );

var AWS = require( 'aws-sdk' );

/**
 * Constructor
 *
 * @constructor
 *
 * @param {Object} credentials             credentials for SQS.
 *
 * @class [AWSQueue Object]
 */
var AWSQueueConstructor = function AWSQueue( credentials ) {
  this.sqs = new Promise.promisifyAll(new AWS.SQS({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    endpoint: AWSQueueConstructor.SQS_ENDPOINT,
    region: credentials.region
  }));
};

/**
 * Returns a list of your queues.
 *
 * @returns {Promise} p
 */
AWSQueueConstructor.prototype.listQueues = function ListQueues() {
  return this.sqs.listQueuesAsync();
};

/**
 * Creates a new standard or FIFO queue.
 *
 * @param {string} name                             The name of the new queue.
 * @param {string} topicArn                         The ARN of the topic you want you want to add in policy.
 * @param {string} receiveWaitTime                  The length of time, in seconds, for which a ReceiveMessage action waits for a message to arrive. Valid values: An integer from 0 to 20 (seconds). The default is 0 (zero).
 * @param {string} delaySeconds                     The delay time in seconds, for which the delivery of all messages in the queue is delayed. Valid values: An integer from 0 to 900 seconds (15 minutes). The default is 0 (zero).
 * @param {string} visibilityTimeout                The duration (in seconds) that the received messages are hidden from subsequent retrieve requests after being retrieved by a ReceiveMessage request
 * @param {string} messageRetentionPeriod           The length of time, in seconds, for which Amazon SQS retains a message. Valid values: An integer from 60 seconds (1 minute) to 1,209,600 seconds (14 days). The default is 345,600 (4 days).
 *
 * @returns {Promise} p
 */
AWSQueueConstructor.prototype.createQueue = function CreateQueue( name, topicArn, receiveWaitTime,
  delaySeconds, visibilityTimeout, messageRetentionPeriod, fifoQueue ) {

  if ( delaySeconds != null && typeof delaySeconds === 'number' ) delaySeconds = delaySeconds.toString();
  if ( messageRetentionPeriod != null && typeof messageRetentionPeriod === 'number' )
    messageRetentionPeriod = messageRetentionPeriod.toString();
  if ( receiveWaitTime != null && typeof receiveWaitTime === 'number' )
      receiveWaitTime = receiveWaitTime.toString();
  if ( visibilityTimeout != null && typeof visibilityTimeout === 'number' )
      visibilityTimeout = visibilityTimeout.toString();

  let self = this;
  let params = {
    QueueName: name,
    Attributes: {}
  };

  if ( delaySeconds != null ) params.Attributes.DelaySeconds = delaySeconds;
  if ( receiveWaitTime != null ) params.Attributes.ReceiveMessageWaitTimeSeconds = receiveWaitTime;
  if ( messageRetentionPeriod != null ) params.Attributes.MessageRetentionPeriod = messageRetentionPeriod;
  if ( visibilityTimeout != null ) params.Attributes.VisibilityTimeout = visibilityTimeout;
  if ( topicArn ) params.Attributes.Policy = JSON.stringify( this.queuePolicyForTopic( topicArn, null, name ) );
  if ( fifoQueue === true ) {
    params.QueueName = name + AWSQueueConstructor.FIFO_SUFFIX;
    params.Attributes.FifoQueue = fifoQueue.toString();
  }

  return this.sqs.createQueueAsync( params );
};

/**
 * Deletes the queue specified by the QueueUrl, even if the queue is empty.
 * If the specified queue doesn't exist, Amazon SQS returns a successful response.
 *
 * @param {string} queueUrl                      The URL of the Amazon SQS queue to delete.
 *
 * @returns {Promise} p
 */
AWSQueueConstructor.prototype.deleteQueue = function DeleteQueue( queueUrl ) {
  return this.sqs.deleteQueueAsync({
    QueueUrl: queueUrl
  });
};

/**
 * Delivers a message to the specified queue.
 * A message can include only XML, JSON, and unformatted text.
 *
 * @param {string} queueUrl                     The URL of the Amazon SQS queue.
 * @param {string} message                      A message can include only XML, JSON, and unformatted text.
 * @param {string} delaySeconds                 The time, in seconds, for which to delay a specific message. Valid values: 0 to 900.
 * @param {string} messageGroupId               The tag that specifies that a message belongs to a specific message group.
 *
 * @returns {Promise} p
 */
AWSQueueConstructor.prototype.sendMessage = function SendMessage(
  queueUrl, messages, delaySeconds, messageGroupId
) {
  let params = { QueueUrl: queueUrl };

  if ( messages instanceof Array ) {
    params.Entries = [];
    for (var i = 0; i < messages.length; i++) {
      params.Entries[i] = {
        Id: i.toString(),
        MessageBody: JSON.stringify( messages[i] )
      }
      if ( delaySeconds ) params.Entries[i].DelaySeconds = delaySeconds;
      if ( messageGroupId ) params.Entries[i].MessageGroupId = messageGroupId;
    }
    if ( messages.length > 0 ) return this.sqs.sendMessageBatchAsync( params );
  } else {

    params.MessageBody = JSON.stringify( messages );
    if ( delaySeconds ) params.DelaySeconds = delaySeconds;
    if ( messageGroupId ) params.MessageGroupId = messageGroupId;
    return this.sqs.sendMessageAsync( params );
  }
};

/**
 * Retrieves one or more messages (up to 10), from the specified queue.
 *
 * @param {string} queueUrl                     The URL of the Amazon SQS queue.
 * @param {string} waitTime                     The duration (in seconds) for which the call waits for a message to arrive in the queue before returning.
 * @param {string} maxNumberOfMessages          The maximum number of messages to return. Valid values are 1 to 10. Default is 1.
 * @param {string} attribute                    The attributes that need to be returned along with each message.
 *
 * @returns {Promise} p
 */
AWSQueueConstructor.prototype.receiveMessage = function ReceiveMessage(
  queueUrl, waitTime, maxNumberOfMessages, attribute
) {
  attribute = ( attribute != null ? attribute : 'All' );
  let params = {
    QueueUrl: queueUrl,
    AttributeNames: [ attribute ]
  };
  if ( waitTime != null ) params.WaitTimeSeconds = waitTime;
  if ( maxNumberOfMessages != null ) params.MaxNumberOfMessages = 3;

  let messages = [];
  return this.sqs.receiveMessageAsync( params ).then( function AfterMessageReceived( data ) {
    if ( data.Messages == null ) return messages;
    else {
      for (var i = 0; i < data.Messages.length; i++) {
        messages[ i ] = JSON.parse( data.Messages[ i ].Body );
      }
      return messages;
    }
  }).catch( function ReceiveMessageError( error ) {
    return messages;
  });
};

/**
 * Deletes the specified message from the specified queue.
 * You specify the message by using the message's receipt handle
 *
 * @param {string} queueUrl                     The URL of the Amazon SQS queue.
 * @param {string} receiptHandle                The receipt handle associated with the message to delete.
 *
 * @returns {Promise} p
 */
AWSQueueConstructor.prototype.deleteMessage = function DeleteMessage( queueUrl, receiptHandle ) {

  if ( receiptHandle instanceof Array ) {
    let params = {
      QueueUrl: queueUrl,
      Entries: []
    };
    for (var i = 0; i < receiptHandle.length; i++) {
      params.Entries[i] = {
        Id: i.toString(),
        ReceiptHandle: receiptHandle[i]
      }
    }
    if ( receiptHandle.length > 0 ) return this.sqs.deleteMessageBatchAsync( params );
  } else {
    return this.sqs.deleteMessageAsync({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle
    });
  }
};

/**
 * Deletes all the messages in a queue specified by the QueueURL parameter.
 *
 * @param {string} queueUrl                      The URL of the Amazon SQS queue to delete.
 *
 * @returns {Promise} p
 */
AWSQueueConstructor.prototype.purgeQueue = function PurgeQueue( queueUrl ) {
  return this.sqs.purgeQueue({
    QueueUrl: queueUrl
  }).promise();
};

/**
 * Sets topic arn on specified queue policy.
 *
 * @param {string} queueUrl                   The URL of the Amazon SQS queue.
 * @param {string} topicArn                   The ARN of the topic you want you want to add in policy.
 *
 * @returns {Promise} p
 */
AWSQueueConstructor.prototype.setTopic = function SetTopic( queueUrl, topicArn ) {
  let self = this;
  return this.getQueueAttributes( queueUrl ).then( function QueueAttributes( data ) {
    return self.sqs.setQueueAttributesAsync({
      QueueUrl: queueUrl,
      Attributes: {
        Policy: JSON.stringify( self.queuePolicyForTopic( topicArn, data.Attributes.QueueArn ) )
      }
    });
  });
};

/**
 * Sets the length of time, in seconds, for which the delivery of all messages in the queue is delayed.
 * Valid values: An integer from 0 to 900 (15 minutes). The default is 0 (zero).
 *
 * @param {string} queueUrl                       The URL of the Amazon SQS queue.
 * @param {string} delaySeconds                   The delay time in seconds.
 *
 * @returns {Promise} p
 */
AWSQueueConstructor.prototype.setDelay = function SetDelay( queueUrl, delaySeconds ) {
  if ( delaySeconds != null && typeof delaySeconds === 'number' ) delaySeconds = delaySeconds.toString();
  return this.sqs.setQueueAttributesAsync({
    QueueUrl: queueUrl,
    Attributes: {
      DelaySeconds: delaySeconds
    }
  });
};

/**
 * The length of time, in seconds, for which Amazon SQS retains a message.
 * Valid values: An integer representing seconds, from 60 (1 minute) to 1,209,600 (14 days).
 * The default is 345,600 (4 days).
 *
 * @param {string} queueUrl                               The URL of the Amazon SQS queue.
 * @param {string} messageRetentionPeriod                 The delay time in seconds.
 *
 * @returns {Promise} p
 */
AWSQueueConstructor.prototype.setMessageRetentionPeriod = function MessageRetentionPeriod(
  queueUrl, messageRetentionPeriod
) {

  if ( messageRetentionPeriod != null && typeof messageRetentionPeriod === 'number' )
    messageRetentionPeriod = messageRetentionPeriod.toString();

  return this.sqs.setQueueAttributesAsync({
    QueueUrl: queueUrl,
    Attributes: {
      MessageRetentionPeriod: messageRetentionPeriod
    }
  });
};

/**
 * Gets the value of one or more queue attributes.
 *
 * @param {string} queueUrl                   The URL of the queue whose information is retrieved.
 * @param {string} attribute                    The attributes that need to be returned along with each message.
 *
 * @returns {Promise} p
 */
AWSQueueConstructor.prototype.getQueueAttributes = function GetQueueAttributes( queueUrl, attribute ) {
  attribute = ( attribute != null ? attribute : 'All' );
  return this.sqs.getQueueAttributesAsync({
    QueueUrl: queueUrl,
    AttributeNames: [ attribute ]
  });
};

/**
 * Function to create sqs policy object for topic.
 *
 * @param {string} topicArn                   The ARN of the topic you want you want to add in policy.
 * @param {string} queueArn                   The Arn of the queue whose information is retrieved.
 * @param {string} queueName                       The name of the new queue.
 *
 * @returns {string} json
 */
AWSQueueConstructor.prototype.queuePolicyForTopic = function QueuePolicyForTopic(
  topicArn, queueArn, queueName
) {

  let policy = {
    "Version": "2012-10-17",
    "Id": "S2A_RIKSOF/SQSDefaultPolicy",
    "Statement": [
      {
        "Sid": "SQSDefaultPolicy001",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "SQS:*",
        "Resource": ( queueArn != null ? queueArn : "arn:aws:sqs:us-east-1:421969266154:" + queueName ),
        "Condition": {
          "ArnEquals": {
            "aws:SourceArn": topicArn
          }
        }
      }
    ]
  };
  return policy;
};

// Constants
AWSQueueConstructor.SQS_ENDPOINT = 'https://sqs.us-east-1.amazonaws.com';
AWSQueueConstructor.FIFO_SUFFIX = '.fifo';

// Make the module available to all
module.exports = AWSQueueConstructor;
