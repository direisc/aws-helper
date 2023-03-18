import { type SQSHandler, type SQSBatchItemFailure, type SQSRecord } from 'aws-lambda'
import { useSQS } from '../sqs/useSQS'

type Runner = (record: SQSRecord) => Promise<void>
interface CreateSQSHandlerConfig {
  reportBatchItemFailures?: boolean
}

/**
 * # createSQSHandlerWithReportFailure
 *
 * Create handler to consume SQS with report batch failure.
 *
 * **⚠
 * SQS trigger with lambda require set Report Batch Item Failures
 * ⚠**
 *
 * @example
 * ```
 * import { createSQSHandlerWithReportFailure } from '@codecarvalho/aws-helper'
 *
 * export const main = createSQSHandlerWithReportFailure(async (record) => {
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
export const createSQSHandlerWithReportFailure =
  (runner: Runner): SQSHandler =>
  async (event, _context) => {
    if (event.Records.length === 0) {
      console.log('Running without message!')
      return
    }
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

/**
 * # createSQSHandlerWithoutReportFailure
 *
 * Create handler to consume SQS without report batch failure.
 *
 * Manage message programmatically, remove from queue on failure.
 *
 * @example
 * ```
 * import { createSQSHandlerWithoutReportFailure } from '@codecarvalho/aws-helper'
 *
 * export const main = createSQSHandlerWithoutReportFailure(
 * async (record) => {
 *   // don't need handle errors with try catch block
 *   const body = record.body
 *   if (body === undefined || body.trim().length === 0) {
 *     // Process with failure, but don't need retry
 *     console.error('Record body is empty')
 *     return
 *   }
 *   // TODO Implementation for consume message record
 *   console.log('Process Record:', body)
 *  }
 * )
 * ```
 */
export const createSQSHandlerWithoutReportFailure =
  (runner: Runner): SQSHandler =>
  async (event, _context) => {
    if (event.Records.length === 0) {
      console.log('Running without message!')
      return
    }
    const sqs = useSQS({})
    const processResponse = await Promise.allSettled(
      event.Records.map(async (record) => {
        try {
          const [, , , , , QueueName] = record.eventSourceARN.split(':')

          await runner(record)

          await sqs.deleteMessageFromRecord(QueueName, record)
        } catch (error) {
          console.error('RUNNER ERROR: ', error)
          const err = error instanceof Error ? error : new Error(String(error))
          throw err.message
        }
      }),
    )

    const batchItemFailures = processResponse
      .map((result) => {
        if (result.status === 'rejected') {
          return result.reason
        } else {
          return false
        }
      })
      .filter(Boolean)

    if (batchItemFailures.length > 0) {
      throw new Error(`Failure with errors: ${JSON.stringify(batchItemFailures)}`)
    }
  }

/**
 * # createSQSHandler
 *
 * Create handler to consume SQS.
 *
 * Configurable handler with `CreateSQSHandlerConfig`
 *
 *
 * **⚠
 * Default configuration with:
 * ⚠**
 *
 * `reportBatchItemFailures = true`
 *
 * @example
 * ```
 * import { createSQSHandler } from '@codecarvalho/aws-helper'
 *
 * export const main = createSQSHandler(
 * async (record) => {
 *   // don't need handle errors with try catch block
 *   const body = record.body
 *   if (body === undefined || body.trim().length === 0) {
 *     // Process with failure, but don't need retry
 *     console.error('Record body is empty')
 *     return
 *   }
 *   // TODO Implementation for consume message record
 *   console.log('Process Record:', body)
 *  },
 * )
 * ```
 */
export const createSQSHandler = (
  runner: Runner,
  config: CreateSQSHandlerConfig = { reportBatchItemFailures: true },
): SQSHandler => {
  if (config.reportBatchItemFailures === true) {
    return createSQSHandlerWithReportFailure(runner)
  } else {
    return createSQSHandlerWithoutReportFailure(runner)
  }
}
