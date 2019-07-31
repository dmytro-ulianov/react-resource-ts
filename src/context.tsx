import React, {useCallback, useContext, useMemo, useState} from 'react'

type Cache = {
  clear: () => void
  get: (key: string) => any
  records: Record<string, any>
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

  const set = useCallback(
    (key: string, value: any) =>
      setRecords(records => ({...records, [key]: value})),
    [setRecords],
  )

  const cache = useMemo(() => ({clear, get, records, set}), [
    clear,
    get,
    records,
    set,
  ])

  return (
    <ResourceContext.Provider value={{cache}}>
      {props.children}
    </ResourceContext.Provider>
  )
}
