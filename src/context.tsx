import React, {useCallback, useContext, useMemo, useState} from 'react'

export type Cache = {
  clear: () => void
  get: (key: string) => any
  records: Record<string, any>
  remove: (key: string) => void
  set: (key: string, value: any) => void
}

const ResourceContext = React.createContext<{cache: Cache} | null>(null)

export const useResourceContext = () => {
  const context = useContext(ResourceContext)
  if (context === null) {
    throw new Error(
      `useResourceContext hook should only be used within ResourceProvider`,
    )
  }
  return context
}

type ProviderProps = {
  records?: Record<string, any>
}

export const ResourceProvider: React.FC<ProviderProps> = props => {
  const [records, setRecords] = useState(props.records || {})

  const clear = useCallback(() => setRecords({}), [setRecords])

  const get = useCallback((key: string) => records[key], [records])

  const remove = useCallback(
    (key: string) => setRecords(records => ({...records, [key]: undefined})),
    [setRecords],
  )

  const set = useCallback(
    (key: string, value: any) =>
      setRecords(records => ({...records, [key]: value})),
    [setRecords],
  )

  const cache = useMemo(() => ({clear, get, records, remove, set}), [
    clear,
    get,
    records,
    remove,
    set,
  ])

  return (
    <ResourceContext.Provider value={{cache}}>
      {props.children}
    </ResourceContext.Provider>
  )
}
