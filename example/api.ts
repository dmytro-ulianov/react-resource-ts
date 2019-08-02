import {Resource} from '@featherweight/resource-ts'

export type Movie = {id: string; title: string}
export type MoviePayload = {id: string}

export type Sequels = {title: string; sequels: string[]}
export type SequelsPayload = {movieTitle: string}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

const movies: Record<string, Movie> = {
  1: {id: '1', title: 'die hard'},
  2: {id: '2', title: 'drive'},
  42: {id: '42', title: 'the matrix'},
}

const fetchMovie = async (payload: MoviePayload): Promise<Movie> => {
  await wait(1000)
  const movie = movies[payload.id]
  return movie || Promise.reject(new Error('movie not found'))
}

const sequels: Record<string, Sequels> = {
  'die hard': {
    title: 'die hard',
    sequels: ['die hard 2', 'die hard with a vengeance'],
  },
  'the matrix': {
    title: 'the matrix',
    sequels: ['the matrix reloaded', 'the matrix revolution'],
  },
}

const fetchSequels = async (payload: SequelsPayload): Promise<Sequels> => {
  await wait(1000)
  const movieSequels = sequels[payload.movieTitle]
  return movieSequels || Promise.reject(new Error('sequels not found'))
}

export {fetchMovie, fetchSequels}
