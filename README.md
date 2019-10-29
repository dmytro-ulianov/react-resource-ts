# @featherweight/react-resource-ts

## Intro

React Resource is a React Hooks library for data fetching based on
[Resource ADT](https://github.com/dmytro-ulianov/resource-ts)

## Install

`npm install --save @featherweight/react-resource-ts @featherweight/resource-ts fp-ts`

Don't forget to install peer dependencies: `@featherweight/resource-ts` and `fp-ts`.

## Quick start

First, you need to wrap you app with `ResourceProvider`.

```tsx
import React from 'react'
import {useResource, Succeded, Failed} from '@featherweight/react-resource-ts'

import {fetchArticles} from './api'

const Articles = () => {
  const articles = useResource(fetchArticles)

  if (articles.isInitial) return null

  if (articles.isPending) return <div>Loading articles...</div>

  return (
    <div>
      <Succeded of={articles.resource}>
        {articles => (
          <ul>
            {articles.map(article => (
              <li>{article.title}</li>
            ))}
          </ul>
        )}
      </Succeded>
      <Failed of={articles.resource}>
        <div>Cannot load articles =(</div>
      </Failed>
    </div>
  )
}
```

## API

### `useResource`

`useResource<O, D, E>(load, config?)`, where
**O** - options for load fuction;
**D** - response type;
**E** - error type;

```tsx
const {
  cancel: () => void,
  error?: E,
  isFailed: boolean,
  isInitial: boolean,
  isPending: boolean,
  isSucceded: boolean,
  reset: () => void,
  resource: Resource<D, E>,
  run: (o: O) => Promise<Resource<D, E>>,
  state: string,
  value?: D,
} = useResource<O, D, E>(
  loadFn: (o: O) => Promise<D>,
  config?: {
    args?: O
    chain?: Resource<any, any>
    defer?: boolean
    dependencies?: any[]
    namespace?: string
    onFail?: (e: E) => void
    onSuccess?: (v: D) => void
    reducer?: CustomReducer<D, E>
    skipPending?: number
  }
)
```

### `useResource.withError`

`useResource.withError<E>()` binds error type and returns `useResource<_, _, E>`.

```ts
import {HTTPErrorType} from './http'

const useHttpResource = useResource.withError<HTTPErrorType>()
```

### `useTask`

`useTask<D>` is an alias for `useResource<_, _, Error>`.

### `create`

Factory function for creating pre-configured `useResource` hook.

```ts
const useUserResource = create(fetchUser, {namespace: 'user'})
```

### `create.withError`

Binds error to factory function.

```ts
const useUserResource = create.withError<HttpErrorType>()(fetchUser, {
  namespace: 'user',
})
```

### Components

You can use helper components to declaratively render ui based on resource state.

```tsx
import {
  Initial,
  Pending,
  Succeded,
  Failed,
} from '@featherweight/react-resource-ts'

const user = useResource(fetchUser)

const rendered = (
  <>
    <Succeded of={user.resource}>
      {(user) => <div>{user.name}</div>}
    </Succeded>
    <Failed of={user.resource}>
      {(error) => <div>{error.toString()}</div>}
    </Failed>
    <Pending of={user.resource} render={() => <div>Loading...</div>}>
    <Initial of={user.resource}>
      <div>Nothing there yet</div>
    </Initial>
  </>
)
```
