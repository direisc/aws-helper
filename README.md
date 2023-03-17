# @codecarvalho/aws-helper

Bundle of helpers for aws-sdk, just an idea for make helper to be useful and handle some cases for simplify developer life.

## Motivation

Sometimes we expected reduce a number of times we type the same code again and again. Some interfaces and usage of `aws-sdk`, and possible another set of aws tools, have a large number of use cases.

Principal idea here is solve that "issue" with some Helpers or Factories to reduce number of lines on my own code, maybe that are helpful for you too.

# What are included?

## createSQSConsumerAllSettled

Create consumer with all needs to run SQS consumer and a batch failure.

_Can catch errors if are expected avoid throw errors, error indicating failure couldn't catching._

**⚠ SQS trigger with lambda require set Report Batch Item Failures**

@example

```typescript
import { createSQSConsumerAllSettled } from '@codecarvalho/aws-helper'

export const main = createSQSConsumerAllSettled(async (record) => {
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
