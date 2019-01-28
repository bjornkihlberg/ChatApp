import { HubConnectionBuilder } from '@aspnet/signalr'
import * as React from 'react'
import { render as renderDom } from 'react-dom'
import { connect, Provider } from 'react-redux'
import { createStore, Dispatch } from 'redux'

import { username as usernamestyle } from './main.css'

const myhub = new HubConnectionBuilder().withUrl('/myhub').build()
myhub.start()

interface IMessage {
    id: string
    user: string
    msg: string
}

export interface IState {
    msgs: IMessage[]
    username: string
    message: string
}

export const RECEIVE_MESSAGES: unique symbol = Symbol()
export const SEND_MESSAGE: unique symbol = Symbol()
export const CHANGE_MESSAGE: unique symbol = Symbol()
export const CHANGE_USERNAME: unique symbol = Symbol()

export type Action =
    | { type: typeof RECEIVE_MESSAGES, msgs: IMessage[] }
    | { type: typeof SEND_MESSAGE, msg: IMessage }
    | { type: typeof CHANGE_MESSAGE, message: string }
    | { type: typeof CHANGE_USERNAME, username: string }

export const reducer = (state: IState | undefined, action: Action): IState => {
    if (state === undefined)
        return { msgs: [], username: '', message: '' }

    switch (action.type) {
        case RECEIVE_MESSAGES: return { ...state, msgs: action.msgs }
        case SEND_MESSAGE: return { ...state, message: '' }
        case CHANGE_MESSAGE: return { ...state, message: action.message }
        case CHANGE_USERNAME: return { ...state, username: action.username }
    }
}

interface IMyComponentProps {
    msgs: IMessage[],
    username: string,
    message: string
}

interface IMyComponentEvents {
    onSend: (user: string, msg: string) => void
    onChangeUsername: (username: string) => void
    onChangeMessage: (message: string) => void
}

const myComponent = ({
    msgs,
    username,
    message,
    onSend,
    onChangeUsername,
    onChangeMessage
}: IMyComponentProps & IMyComponentEvents) =>
    <>
        <h1>chat</h1>
        <label>Username:</label>
        <input type='text' value={username} onChange={e => onChangeUsername(e.target.value)} />
        <br />
        <label>Message:</label>
        <input type='text' value={message} onChange={e => onChangeMessage(e.target.value)} />
        <button onClick={() => onSend(username, message)}>send</button>
        <br />
        Messages:
        <div>
            {msgs.map(({ id, user, msg }) => <div key={id}><b className={usernamestyle}>{user}: </b><i>{msg}</i></div>)}
        </div>
    </>

const mapStateToProps = ({ msgs, username, message }: IState): IMyComponentProps => ({
    message,
    msgs: msgs.reduce((acc: IMessage[], msg: IMessage) => [msg, ...acc], []),
    username,
})

const mapDispatchToEvents = (dispatch: Dispatch<Action>): IMyComponentEvents => ({
    onChangeMessage: message => { dispatch({ type: CHANGE_MESSAGE, message }) },
    onChangeUsername: username => { dispatch({ type: CHANGE_USERNAME, username }) },
    onSend: (user, msg) => { myhub.invoke('PostMessage', user, msg) },
})

export const MyComponent = connect(mapStateToProps, mapDispatchToEvents)(myComponent)

const store = createStore(reducer)
myhub.on('receiveMessages', (data: Array<{ item1: string, item2: string, item3: string }>) => {
    const msgs = data.map(({ item1, item2, item3 }) => ({ id: item1, user: item2, msg: item3 }))
    store.dispatch({ type: RECEIVE_MESSAGES, msgs })
})

const app =
    <Provider store={store}>
        <MyComponent />
    </Provider>

renderDom(app, document.getElementById('app'))
