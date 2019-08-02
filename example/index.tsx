import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {ResourceProvider} from '../src'
import {App, AppWithUseEffect} from './app'

ReactDOM.render(
  <ResourceProvider>
    <div style={{marginBottom: 16}}>
      app 1
      <App id="2" />
    </div>
    <div>
      app 2
      <AppWithUseEffect id="42" />
    </div>
  </ResourceProvider>,
  document.getElementById('root'),
)
