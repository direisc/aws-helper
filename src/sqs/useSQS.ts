import {
  DeleteMessageCommand,
  GetQueueUrlCommand,
  SendMessageCommand,
  SQSClient,
  type SQSClientConfig,
  type DeleteMessageCommandInput,
  type SendMessageCommandInput,
  type MessageAttributeValue,
} from '@aws-sdk/client-sqs'
import { type SQSRecord } from 'aws-lambda'

type GetQueueURL = (QueueName: string) => Promise<string | undefined>
export const getQueueURL =
  (sqsClient: SQSClient): GetQueueURL =>
  async (QueueName: string): Promise<string | undefined> => {
    const getQueueUrlCommandOutput = await sqsClient.send(
      new GetQueueUrlCommand({
        QueueName,
      }),
    )
    return getQueueUrlCommandOutput.QueueUrl
  }

type SendMessage = (input: SendMessageCommandInput) => Promise<void>
export const sendMessage =
  (sqsClient: SQSClient): SendMessage =>
  async (input: SendMessageCommandInput): Promise<void> => {
    await sqsClient.send(new SendMessageCommand(input))
  }

type SendMessageFromRecord = (
  QueueUrlOrName: string,
  record: SQSRecord,
  MessageAttributes?: Record<string, MessageAttributeValue>,
) => Promise<void>
export const sendMessageFromRecord =
  (sqsClient: SQSClient): SendMessageFromRecord =>
  async (
    QueueUrlOrName: string,
    record: SQSRecord,
    MessageAttributes?: Record<string, MessageAttributeValue>,
  ): Promise<void> => {
    const QueueUrl = QueueUrlOrName.startsWith('http')
      ? QueueUrlOrName
      : await getQueueURL(sqsClient)(QueueUrlOrName)

    await sendMessage(sqsClient)({
      QueueUrl,
      MessageBody: record.body,
      MessageAttributes: {
        ...(record.messageAttributes as any),
        ...MessageAttributes,
      },
    })
  }

type DeleteMessage = (input: DeleteMessageCommandInput) => Promise<void>
export const deleteMessage =
  (sqsClient: SQSClient): DeleteMessage =>
  async (input: DeleteMessageCommandInput): Promise<void> => {
    await sqsClient.send(new DeleteMessageCommand(input))
  }

type DeleteMessageFromRecord = (QueueUrlOrName: string, record: SQSRecord) => Promise<void>
export const deleteMessageFromRecord =
  (sqsClient: SQSClient): DeleteMessageFromRecord =>
  async (QueueUrlOrName: string, record: SQSRecord): Promise<void> => {
    const QueueUrl = QueueUrlOrName.startsWith('http')
      ? QueueUrlOrName
      : await getQueueURL(sqsClient)(QueueUrlOrName)

    await deleteMessage(sqsClient)({ QueueUrl, ReceiptHandle: record.receiptHandle })
  }

interface UseSQS {
  sqsClient: SQSClient
  getQueueURL: GetQueueURL
  deleteMessage: DeleteMessage
  sendMessage: SendMessage
  deleteMessageFromRecord: DeleteMessageFromRecord
  sendMessageFromRecord: SendMessageFromRecord
}
export const useSQS = (configuration: SQSClientConfig): UseSQS => {
  const sqsClient = new SQSClient(configuration)
  return {
    sqsClient,
    getQueueURL: getQueueURL(sqsClient),
    deleteMessage: deleteMessage(sqsClient),
    sendMessage: sendMessage(sqsClient),
    deleteMessageFromRecord: deleteMessageFromRecord(sqsClient),
    sendMessageFromRecord: sendMessageFromRecord(sqsClient),
  }
}
