import { type SQSHandler, type SQSBatchItemFailure, type SQSRecord } from 'aws-lambda'
type Runner = (record: SQSRecord) => Promise<void>

/**
 * createSQSConsulerAllSettled
 * Create consumer with all needs to run SQS consumer and a batch failure
 *
 * Can catch errors if are expected avoid throw errors,
 * error indicating failure couldn't catching.
 *
 * @example
 * ```
 * export const main = createSQSConsulerAllSettled(async (record) => {
 *   // TODO Implementation for consume message record
 *   // don't need handle errors with try catch block
 * })
 * ```
 */
export const createSQSConsulerAllSettled =
  (runner: Runner): SQSHandler =>
  async (event, _context) => {
    const processResponse = await Promise.allSettled(
      event.Records.map(async (record) => {
        try {
          await runner(record)
        } catch (error) {
          console.error('PROCESS ERROR: ', error)
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
