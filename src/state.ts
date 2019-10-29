import {
  failed,
  initial,
  pending,
  succeded,
  Resource,
} from '@featherweight/resource-ts'

type Action<D, E> =
  | {type: 'failed'; payload: {error: E}}
  | {type: 'initial'}
  | {type: 'pending'}
  | {type: 'succeded'; payload: {value: D}}

const reducer = <D, E>(
  _state: Resource<D, E>,
  action: Action<D, E>,
): Resource<D, E> => {
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
      return _state
  }
}

export type CustomReducer<D = any, E = any> = (
  state: Resource<D, E>,
  action: Action<D, E>,
  nextState: Resource<D, E>,
) => Resource<D, E>

export const getReducer = <D, E>(
  customReducer: CustomReducer<D, E> = (_a, _b, _c) => _c,
) => (state: Resource<D, E>, action: Action<D, E>) => {
  const nextState = reducer(state, action)
  return customReducer(state, action, nextState)
}
