import * as React from 'react'
import { render as renderDom } from 'react-dom'
import { connect, Provider } from 'react-redux'
import { createStore, Dispatch } from 'redux'

import { header } from './main.css'

export interface IState { i: number }

export const INCREMENT: unique symbol = Symbol()
export const DECREMENT: unique symbol = Symbol()

export type Action =
    | { type: typeof INCREMENT }
    | { type: typeof DECREMENT }

export const reducer = (state: IState | undefined, action: Action): IState => {
    if (state === undefined)
        return { i: 0 }

    switch (action.type) {
        case INCREMENT: return { ...state, i: state.i + 1 }
        case DECREMENT: return { ...state, i: state.i - 1 }
    }
}

interface IMyComponentProps {
    i: number
}

interface IMyComponentEvents {
    onIncrement: () => void
    onDecrement: () => void
}

const myComponent = ({ i, onIncrement, onDecrement }: IMyComponentProps & IMyComponentEvents) =>
    <>
        <h1 className={header}>{i}</h1>
        <button onClick={onIncrement}>Increment</button>
        <button onClick={onDecrement}>Decrement</button>
    </>

const mapStateToProps = ({ i }: IState): IMyComponentProps => ({ i })

const mapDispatchToEvents = (dispatch: Dispatch<Action>): IMyComponentEvents => ({
    onDecrement: () => dispatch({ type: DECREMENT }),
    onIncrement: () => dispatch({ type: INCREMENT }),
})

export const MyComponent = connect(mapStateToProps, mapDispatchToEvents)(myComponent)

const app =
    <Provider store={createStore(reducer)}>
        <MyComponent />
    </Provider>

renderDom(app, document.getElementById('app'))
