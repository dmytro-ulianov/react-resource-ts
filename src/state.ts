import {
  failed,
  initial,
  pending,
  succeded,
  Resource,
} from '@featherweight/resource-ts'

export type ReducerState<D = any, E = any> = Resource<D, E>

type Action =
  | {type: 'failed'; payload: {error: any}}
  | {type: 'initial'}
  | {type: 'pending'}
  | {type: 'succeded'; payload: {value: any}}

const reducer = (_state: ReducerState, action: Action) => {
  switch (action.type) {
    case 'failed':
      return failed(action.payload.error)
    case 'initial':
      return initial
    case 'pending':
      return pending
    case 'succeded':
      return succeded(action.payload.value)
    default:
      throw new Error(`Action type is not allowed`)
  }
}

export type CustomReducer<D = any, E = any> = (
  state: Resource<D, E>,
  action: Action,
  newState: Resource<D, E>,
) => Resource<D, E>

export const getReducer = <D, E>(
  customReducer: CustomReducer<D, E> = (_a, _b, _c) => _c,
) => (state: ReducerState<D, E>, action: Action) => {
  const rootResult = reducer(state, action)
  return customReducer(state || rootResult, action, rootResult)
}
