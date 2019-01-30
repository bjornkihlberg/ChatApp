import { Button, Grid, Input, List, ListItem, ListItemText, Paper } from '@material-ui/core'
import * as React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { chathistorycontainer, chathistoryscrollpaper, maincontainer } from './App.css'

export interface IMessage {
    userName: string
    content: string
}

type TaggedMessage = { id: string } & IMessage

interface IState {
    message: string
    messages: TaggedMessage[]
    signalRConnectionEstablished: boolean
    userName: string
}

const initialState: IState = {
    message: '',
    messages: [],
    signalRConnectionEstablished: false,
    userName: '',
}

export const ESTABLISH_SIGNALR_CONNECTION: unique symbol = Symbol()
export const APPEND_MESSAGE: unique symbol = Symbol()
export const CHANGE_USERNAME: unique symbol = Symbol()
export const CHANGE_MESSAGE: unique symbol = Symbol()

type Action =
    | { type: typeof ESTABLISH_SIGNALR_CONNECTION }
    | { type: typeof APPEND_MESSAGE, message: IMessage }
    | { type: typeof CHANGE_USERNAME, userName: string }
    | { type: typeof CHANGE_MESSAGE, message: string }

export const reducer = (state: IState | undefined, action: Action): IState => {
    if (state === undefined)
        return initialState

    switch (action.type) {
        case ESTABLISH_SIGNALR_CONNECTION: return { ...state, signalRConnectionEstablished: true }
        case APPEND_MESSAGE: return {
            ...state,
            messages: [{ id: `${Math.random()}`, ...action.message }, ...state.messages]
        }
        case CHANGE_USERNAME: return { ...state, userName: action.userName }
        case CHANGE_MESSAGE: return { ...state, message: action.message }
    }
}

interface IPorts {
    onSendMessage: (message: IMessage) => void
}

interface IProps {
    hasConnection: boolean
    message: string
    messages: TaggedMessage[]
    userName: string
}

// tslint:disable:no-empty-interface
interface IEvents {
    onUserNameChange: (userName: string) => void
    onMessageChange: (message: string) => void
}

const app = ({
    userName,
    message,
    messages,
    onUserNameChange,
    onMessageChange,
    onSendMessage
}: IProps & IEvents & IPorts) =>
    <Grid className={maincontainer} container>
        <Grid item xs={12}>
            <Input placeholder='Username' value={userName} onChange={e => onUserNameChange(e.target.value)} />
        </Grid>
        <Grid item xs={12} className={chathistorycontainer}>
            <Paper className={chathistoryscrollpaper}>
                <List>
                    {messages.map(({ id, content, userName }) =>
                        <ListItem key={id}><ListItemText><b>{userName}: </b>{content}</ListItemText></ListItem>)}
                    <div ref={el => el && el.scrollIntoView({ behavior: 'smooth' })} />
                </List>
            </Paper>
        </Grid>
        <Grid item xs={12}>
            <Input placeholder='Message' value={message} onChange={e => onMessageChange(e.target.value)}
                onKeyUp={e => e.key === 'Enter' && onSendMessage({ userName, content: message })} />
            <Button onClick={() => onSendMessage({ userName, content: message })}>send</Button>
        </Grid>
    </Grid>

const mapStateToProps = ({ signalRConnectionEstablished, message, messages, userName }: IState): IProps => ({
    hasConnection: signalRConnectionEstablished,
    message,
    messages: messages.reduce((acc: TaggedMessage[], message) => [message, ...acc], []),
    userName
})

const mapDispatchToEvents = (dispatch: Dispatch<Action>): IEvents => ({
    onMessageChange: message => dispatch({ type: CHANGE_MESSAGE, message }),
    onUserNameChange: userName => dispatch({ type: CHANGE_USERNAME, userName }),
})

export const App = connect(mapStateToProps, mapDispatchToEvents)(app)
