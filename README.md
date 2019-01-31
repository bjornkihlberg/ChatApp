# ChatApp
Browser based chat application. Server is written in
[F#.NET](https://fsharp.org/)
with
[ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/?view=aspnetcore-2.2#pivot=core)
and the web framework
[Giraffe](https://github.com/giraffe-fsharp/Giraffe).
[SignalR](https://www.asp.net/signalr)
is used to simplify pushing and pulling between server and client through websockets.
The
[TypeScript](https://www.typescriptlang.org/)
language is used in the frontend with
[React](https://reactjs.org/)
+
[Redux](https://redux.js.org/)
to architecture the application in a
[type safe](https://en.wikipedia.org/wiki/Type_safety)
[declarative](https://en.wikipedia.org/wiki/Declarative_programming)
style.
[Material UI](https://material-ui.com/) is used for styling elements with a modern and professional look.

---
## Instructions
1. Install client dependencies with command:
    ```
    npm install
    ```
1. Run automated development build process of client code with command:
    ```
    npm run build
    ```
    *Watches the source files for changes and compiles on save.*

1. Start server with command:
    ```
    npm run server
    ```
    *Dependencies should download automatically for dotnet core*

1. Compile optimized build targets of client code with command:
    ```
    npm run release
    ```
