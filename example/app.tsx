import * as React from 'react'

import {fetchMovie, fetchSequels, Movie, Sequels} from './api'
import {is, resource, Resource as R} from '@featherweight/resource-ts'
import {useTask, Succeded, Failed, Pending} from '../src'

type AppProps = {id: string}
type AppUIProps = {movie: R<Movie, Error>; sequels: R<Sequels, Error>}

const json = (a: any) => JSON.stringify(a)

const Res: React.FC = props => {
  return <pre>{props.children}</pre>
}

const Rej: React.FC = props => (
  <span style={{color: 'tomato'}}>{props.children}</span>
)

const AppUI: React.FC<AppUIProps> = ({movie, sequels}) => {
  return (
    <>
      <Pending of={resource.concat(movie, sequels)}>
        <p>loading...</p>
      </Pending>
      <Succeded of={movie}>
        {movie => (
          <Res>
            <b>movie</b> {json(movie)}
          </Res>
        )}
      </Succeded>
      <Failed of={movie}>{e => <Rej>{e.message}</Rej>}</Failed>
      <Succeded of={sequels}>
        {s => (
          <Res>
            <b>sequels</b> {json(s)}
          </Res>
        )}
      </Succeded>
      <Failed of={sequels}>{e => <Rej>{e.message}</Rej>}</Failed>
    </>
  )
}

export const App: React.FC<AppProps> = props => {
  const movie = useTask(fetchMovie, {
    args: {id: props.id},
    dependencies: [props.id],
  })
  const sequels = useTask(fetchSequels, {
    args: resource.foldS(movie.resource, movie => ({movieTitle: movie.title})),
    chain: movie.resource,
    dependencies: [movie.resource],
  })
  return <AppUI movie={movie.resource} sequels={sequels.resource} />
}

export const AppWithUseEffect: React.FC<{id: string}> = props => {
  const movie = useTask(fetchMovie, {defer: true})
  const sequels = useTask(fetchSequels, {defer: true})

  React.useEffect(() => {
    fetchData()
    async function fetchData() {
      const movieR = await movie.run({id: props.id})
      if (is.succeded(movieR)) {
        await sequels.run({movieTitle: movieR.value.title})
      }
    }
  }, [props.id])

  return <AppUI movie={movie.resource} sequels={sequels.resource} />
}
