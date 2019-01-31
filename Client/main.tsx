import { HubConnectionBuilder } from '@aspnet/signalr'
import * as React from 'react'
import { render as renderDOM } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { App, APPEND_MESSAGE, ESTABLISH_SIGNALR_CONNECTION, IMessage, reducer } from './App'

const myhub = new HubConnectionBuilder().withUrl('/myhub').build()
const connectionEstablishment = myhub.start()

const store = createStore(reducer)

connectionEstablishment.then(() => store.dispatch({ type: ESTABLISH_SIGNALR_CONNECTION }))

myhub.on('receiveMessage', (message: IMessage) => store.dispatch({ type: APPEND_MESSAGE, message }))

const app =
    <Provider store={store}>
        <App onSendMessage={({ userName, content }) => myhub.invoke('PostMessage', { userName, content })} />
    </Provider>

renderDOM(app, document.getElementById('app'))
