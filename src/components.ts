import {AnyResource, Resource, is} from '@featherweight/resource-ts'

export type InitialProps = {
  of: AnyResource
  render?: () => React.ReactNode
}

export const Initial: React.FC<InitialProps> = props => {
  if (is.initial(props.of)) {
    if (typeof props.children === 'function') {
      return props.children()
    }
    if (props.render) {
      return props.render()
    }
    if (props.children) {
      return props.children
    }
  }
  return null
}

export type PendingProps = {
  of: AnyResource
  render?: () => React.ReactNode
}

export const Pending: React.FC<PendingProps> = props => {
  if (is.pending(props.of)) {
    if (typeof props.children === 'function') {
      return props.children()
    }
    if (props.render) {
      return props.render()
    }
    if (props.children) {
      return props.children
    }
  }
  return null
}

export type FailedProps<E> = {
  of: Resource<any, E>
  render?: (e: E) => React.ReactNode
  children?: ((e: E) => React.ReactNode) | React.ReactNode
}

export const Failed = <E>(props: FailedProps<E>) => {
  if (is.failed(props.of)) {
    if (typeof props.children === 'function') {
      return props.children(props.of.error)
    }
    if (props.render) {
      return props.render(props.of.error)
    }
    if (props.children) {
      return props.children
    }
  }
  return null
}

export type SuccededProps<D> = {
  children?: ((v: D) => React.ReactNode) | React.ReactNode
  of: Resource<D, any>
  render?: (v: D) => React.ReactNode
}

export const Succeded = <D>(props: SuccededProps<D>) => {
  if (is.succeded(props.of)) {
    if (typeof props.children === 'function') {
      return props.children(props.of.value)
    }
    if (props.render) {
      return props.render(props.of.value)
    }
    if (props.children) {
      return props.children
    }
  }
  return null
}
