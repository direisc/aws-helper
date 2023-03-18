# @codecarvalho/aws-helper

Bundle of helpers for aws-sdk, just an idea for make helper to be useful and handle some cases for simplify developer life.

## Motivation

Sometimes we expected reduce a number of times we type the same code again and again. Some interfaces and usage of `aws-sdk`, and possible another set of aws tools, have a large number of use cases.

Principal idea here is solve that "issue" with some Helpers or Factories to reduce number of lines on my own code, maybe that are helpful for you too.

## Install and usage

```bash
npm add @codecarvalho/aws-helper --save
# or
yarn add @codecarvalho/aws-helper
# or
pnpm add @codecarvalho/aws-helper
```

Another entry points:

- `@codecarvalho/aws-helper/sqs`
- `@codecarvalho/aws-helper/lambda`

# What are included?

## createSQSHandler

Create handler to consume SQS.

Configurable handler with `CreateSQSHandlerConfig`

**⚠ Default configuration with:⚠** `reportBatchItemFailures = true`

@example

```typescript
import { createSQSHandler } from '@codecarvalho/aws-helper'

export const main = createSQSHandler(async (record) => {
  // don't need handle errors with try catch block
  const body = record.body
  if (body === undefined || body.trim().length === 0) {
    // Process with failure, but don't need retry
    console.error('Record body is empty')
    return
  }
  // TODO Implementation for consume message record
  console.log('Process Record:', body)
})
```

## createSQSHandlerWithReportFailure

Create handler to consume SQS with report batch failure.

**⚠ SQS trigger with lambda require set Report Batch Item Failures ⚠**

@example

```typescript
import { createSQSHandlerWithReportFailure } from '@codecarvalho/aws-helper'

export const main = createSQSHandlerWithReportFailure(async (record) => {
  // don't need handle errors with try catch block
  const body = record.body
  if (body === undefined || body.trim().length === 0) {
    // Process with failure, but don't need retry
    console.error('Record body is empty')
    return
  }
  // TODO Implementation for consume message record
  console.log('Process Record:', body)
})
```

## createSQSHandlerWithoutReportFailure

Create handler to consume SQS without report batch failure.

Manage message programmatically, remove from queue on failure.

@example

```typescript
import { createSQSHandlerWithoutReportFailure } from '@codecarvalho/aws-helper'

export const main = createSQSHandlerWithoutReportFailure(async (record) => {
  // don't need handle errors with try catch block
  const body = record.body
  if (body === undefined || body.trim().length === 0) {
    // Process with failure, but don't need retry
    console.error('Record body is empty')
    return
  }
  // TODO Implementation for consume message record
  console.log('Process Record:', body)
})
```
