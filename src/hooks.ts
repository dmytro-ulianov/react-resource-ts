import {
  failed,
  initial,
  is,
  Resource,
  succeded,
  Tag,
} from '@featherweight/resource-ts'
import {getReducer, CustomReducer} from './state'
import {useEffect, useReducer, useRef, useMemo} from 'react'
import {useResourceContext} from './context'

const noop = () => {}

export type Meta = {signal: AbortController['signal']}

export type F<O = any, D = any> = (o: O, m: Meta) => Promise<D>

export type Config<O = any, D = any, E = any> = {
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

const toDefaults = <O, D, E>(
  c: Config<O, D, E>,
): Required<Config<O, D, E>> => ({
  args: c.args || ((null as unknown) as O),
  chain: c.chain || succeded(true),
  defer: c.defer || false,
  dependencies: c.dependencies || [],
  namespace: c.namespace || '',
  onFail: c.onFail || noop,
  onSuccess: c.onSuccess || noop,
  reducer: c.reducer || ((_s, _a, state) => state),
  skipPending: c.skipPending || 300,
})

const useAbortController = () => {
  const abortControllerRef = useRef<AbortController | null>(null)

  if (abortControllerRef.current === null) {
    abortControllerRef.current = new AbortController()
  }

  return useMemo(
    () => ({
      abort: () => (abortControllerRef.current as AbortController).abort(),
      renew: () => (abortControllerRef.current = new AbortController()),
      signal: () => (abortControllerRef.current as AbortController).signal,
    }),
    [],
  )
}

const useIsMounted = () => {
  const mountedRef = useRef(false)
  useEffect(() => {
    mountedRef.current = true
  }, [])
  return mountedRef
}

type ResourceBase<O, D, E> = {
  cancel: () => void
  reset: () => void
  resource: Resource<D, E>
  run: (args?: O) => Promise<Resource<D, E>>
}

type ResourceValues<D, E> =
  | {
      isFailed: false
      isInitial: true
      isPending: false
      isSucceded: false
      state: 'initial'
    }
  | {
      isFailed: false
      isInitial: false
      isPending: true
      isSucceded: false
      state: 'pending'
    }
  | {
      isFailed: true
      isInitial: false
      isPending: false
      isSucceded: false
      state: 'failed'
      error: E
    }
  | {
      isFailed: false
      isInitial: false
      isPending: false
      isSucceded: true
      state: 'succeded'
      value: D
    }

type ResourceReturnType<O, D, E> = ResourceBase<O, D, E> & ResourceValues<D, E>

export const useResource = <O, D, E = any>(
  f: F<O, D>,
  config: Config<O, D, E> = {},
): ResourceReturnType<O, D, E> => {
  const _config = toDefaults(config)

  const context = useResourceContext()

  const [state, update] = useReducer(getReducer(_config.reducer), initial)
  const abortController = useAbortController()
  const isMounted = useIsMounted()

  const cancelF = () => {
    abortController.abort()
    abortController.renew()
  }

  const resetF = () => {
    update({type: 'initial'})
    if (_config.namespace) {
      context.cache.remove(_config.namespace)
    }
  }

  const callF = (args?: O): Promise<Resource<D, E>> => {
    if (_config.namespace) {
      const value = context.cache.get(_config.namespace)
      if (value) {
        update({type: 'succeded', payload: {value}})
      }
    }

    let pendingAction: () => void
    let pendingTimeout: number

    const ms = _config.skipPending || 300

    if (ms > 0) {
      pendingAction = () => {
        pendingTimeout = window.setTimeout(() => update({type: 'pending'}), ms)
      }
    } else {
      pendingAction = () => update({type: 'pending'})
    }

    return new Promise(resolve =>
      Promise.resolve(pendingAction())
        .then(cancelF)
        .then(() => {
          return new Promise(async () => {
            let finish
            try {
              const value = await f(args || _config.args, {
                signal: abortController.signal(),
              })
              finish = () => {
                if (_config.namespace) {
                  context.cache.set(_config.namespace, value)
                }
                if (isMounted.current) {
                  update({type: 'succeded', payload: {value}})
                  resolve(succeded(value))
                  _config.onSuccess(value)
                }
              }
            } catch (error) {
              finish = () => {
                if (isMounted.current) {
                  update({type: 'failed', payload: {error}})
                  resolve(failed(error))
                  _config.onFail(error)
                }
              }
            }
            clearTimeout(pendingTimeout)
            finish()
          })
        }),
    )
  }

  useEffect(() => {
    if (!_config.defer && is.succeded(_config.chain)) callF()
    // eslint-disable-next-line
  }, _config.dependencies)

  const base: ResourceBase<O, D, E> = {
    cancel: cancelF,
    reset: resetF,
    resource: state,
    run: callF,
  }

  const values: ResourceValues<D, E> = {
    error: is.failed(state) ? state.error : undefined,
    isFailed: is.failed(state) as any,
    isInitial: is.initial(state) as any,
    isPending: is.pending(state) as any,
    isSucceded: is.succeded(state) as any,
    state: state._tag as any,
    value: is.succeded(state) ? state.value : undefined,
  }

  return {...base, ...values}
}

useResource.withError = <E>() => <O, D>(
  f: F<O, D>,
  config?: Config<O, D, E>,
): ResourceReturnType<O, D, E> => useResource<O, D, E>(f, config)

export const useTask = <O, D>(f: F<O, D>, config?: Config<O, D, Error>) => {
  return useResource.withError<Error>()(f, config)
}

export const create = <O, D, E = any>(
  f: F<O, D>,
  factoryConfig?: Config<O, D, E>,
) => {
  const useResourceHook = (config?: Config<O>) => {
    return useResource<O, D, E>(f, {...factoryConfig, ...config})
  }
  return useResourceHook
}

create.withError = <E>() => <O, D>(
  f: F<O, D>,
  factoryConfig?: Config<O, D, E>,
) => {
  const useResourceHook = (config?: Config<O, D, E>) => {
    return useResource<O, D, E>(f, {...factoryConfig, ...config})
  }
  return useResourceHook
}
