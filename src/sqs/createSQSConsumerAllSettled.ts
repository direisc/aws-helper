import { type SQSHandler, type SQSBatchItemFailure, type SQSRecord } from 'aws-lambda'
type Runner = (record: SQSRecord) => Promise<void>

/**
 * # createSQSConsumerAllSettled
 *
 * Create consumer with all needs to run SQS consumer and a batch failure.
 *
 * Can catch errors if are expected avoid throw errors,
 * error indicating failure couldn't catching.
 *
 * ## ⚠ SQS trigger with lambda require set Report Batch Item Failures
 *
 * @example
 * ```
 * export const main = createSQSConsumerAllSettled(async (record) => {
 *   // don't need handle errors with try catch block
 *   const body = record.body
 *   if (body === undefined || body.trim().length === 0) {
 *     // Process with failure, but don't need retry
 *     console.error('Record body is empty')
 *     return
 *   }
 *   // TODO Implementation for consume message record
 *   console.log('Process Record:', body)
 * })
 * ```
 */
export const createSQSConsumerAllSettled =
  (runner: Runner): SQSHandler =>
  async (event, _context) => {
    const processResponse = await Promise.allSettled(
      event.Records.map(async (record) => {
        try {
          await runner(record)
        } catch (error) {
          console.error('RUNNER ERROR: ', error)
          throw record
        }
      }),
    )
    return {
      batchItemFailures: processResponse
        .map((result) => {
          if (result.status === 'rejected') {
            return { itemIdentifier: result.reason.messageId }
          } else {
            return false as unknown as SQSBatchItemFailure
          }
        })
        .filter(Boolean),
    }
  }
