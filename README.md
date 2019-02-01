# ChatApp
![chatsessh](https://user-images.githubusercontent.com/38290734/52056441-8f237880-2562-11e9-8d9e-f585a61900c2.gif)
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
[Material UI](https://material-ui.com/) is used for styling elements for a modern and professional look.

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
    *Dependencies should download automatically for dotnet core.*

1. Compile optimized build targets of client code with command:
    ```
    npm run release
    ```

---
## How it works
Given that the purpose of this project is to store useful knowledge for future reference I will be more detailed in explaining the server than I will with the client code.
### The server
Let's start by taking a look at the server code by building it up gradually. *Since Giraffe isn't technically used in this project (and probably should be removed), I won't include it here.*
#### Minimal code to get an unconfigured [Kestrel](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-2.2) server running
```fsharp
open System
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting

let configureApp (_: IApplicationBuilder): unit = ()

[<EntryPoint>]
let main _ =
    WebHostBuilder()
        .UseKestrel()
        .Configure(Action<IApplicationBuilder> configureApp)
        .Build()
        .Run()
    0 // return an integer exit code

```
This server is useless as far as I know. It can't serve anything.
#### Let's change that by making it serve static files in the `public` folder
```fsharp
open System
open System.IO
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting

let configureApp (app: IApplicationBuilder): unit =
    app.UseDefaultFiles()
       .UseStaticFiles()
    |> ignore

[<EntryPoint>]
let main _ =
    let publicPath = Path.GetFullPath "./public"

    WebHostBuilder()
        .UseKestrel()
        .UseWebRoot(publicPath)
        .UseContentRoot(publicPath)
        .Configure(Action<IApplicationBuilder> configureApp)
        .Build()
        .Run()
    0 // return an integer exit code
```
To tell our server to serve static files we call the methods `UseDefaultFiles()` and `UseStaticFiles()` in the application configuration function `configureApp`.
```fsharp
let configureApp (app: IApplicationBuilder): unit =
    app.UseDefaultFiles()
       .UseStaticFiles()
    |> ignore
```
The methods `UseWebRoot` and `UseContentRoot` on the `WebHostBuilder` object allow us to specify where our server should look for static files automatically.
```fsharp
let publicPath = Path.GetFullPath "./public"
// ...

.UseWebRoot(publicPath)
.UseContentRoot(publicPath)
```
#### Next let's include SignalR in the server before configuring it
```fsharp
open System
open System.IO
open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.AspNetCore.SignalR
open Microsoft.Extensions.DependencyInjection

type MyHub() =
    inherit Hub()

let configureApp (app: IApplicationBuilder): unit =
    app.UseDefaultFiles()
       .UseStaticFiles()
       .UseSignalR(fun routes -> routes.MapHub<MyHub>(PathString "/myhub"))
    |> ignore

let configureServices (services: IServiceCollection): unit =
    services.AddSignalR() |> ignore

[<EntryPoint>]
let main _ =
    let publicPath = Path.GetFullPath "./public"

    WebHostBuilder()
        .UseKestrel()
        .UseWebRoot(publicPath)
        .UseContentRoot(publicPath)
        .Configure(Action<IApplicationBuilder> configureApp)
        .ConfigureServices(configureServices)
        .Build()
        .Run()
    0 // return an integer exit code
```
We need to create a class inheriting from the `Hub`-class which defines client-server interactions.
```fsharp
type MyHub() =
    inherit Hub()
```
Even though this is a class, one cannot seem to persist mutable state in it as the class seems to be instantiated and destroyed only as it's needed.

The method `UseSignalR` is invoked in the app configuration step and configured with an endpoint `/myhub` to access our hub methods.
```fsharp
.UseSignalR(fun routes -> routes.MapHub<MyHub>(PathString "/myhub"))
```
A service configuration function `configureServices` is required for SignalR to work and is passed to the `ConfigureServices` method on the `WebHostBuilder` object.
```fsharp
.ConfigureServices(configureServices)
```
#### Finally we configure our `Hub` class how to interact with clients
```fsharp
open System
open System.IO
open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.AspNetCore.SignalR
open Microsoft.Extensions.DependencyInjection

type Message = { userName: string
                 content: string }

type MyHub() =
    inherit Hub()
    member __.PostMessage(message: Message): unit =
        __.Clients.All.SendAsync("receiveMessage", message) |> ignore

let configureApp (app: IApplicationBuilder): unit =
    app.UseDefaultFiles()
       .UseStaticFiles()
       .UseSignalR(fun routes -> routes.MapHub<MyHub>(PathString "/myhub"))
    |> ignore

let configureServices (services: IServiceCollection): unit =
    services.AddSignalR() |> ignore

[<EntryPoint>]
let main _ =
    let publicPath = Path.GetFullPath "./public"

    WebHostBuilder()
        .UseKestrel()
        .UseWebRoot(publicPath)
        .UseContentRoot(publicPath)
        .Configure(Action<IApplicationBuilder> configureApp)
        .ConfigureServices(configureServices)
        .Build()
        .Run()
    0 // return an integer exit code
```
We want our server to receive objects representing messages containing the contents of the message itself as well as the name of the sender. The first step is to define a record type for those objects.
```fsharp
type Message = { userName: string
                 content: string }
```
Next we define a method I've decided to call `PostMessage` that takes an object of type `Message` and performs some side effect.
```fsharp
member __.PostMessage(message: Message): unit =
    // ...
```
This method can be invoked directly by the client to run on the server. In our case we want `PostMessage` to send the message back to all clients connected to `/myhub`. We do this by calling
```fsharp
__.Clients.All.SendAsync("receiveMessage", message) |> ignore
```
`SendAsync` triggers an event on clients called `receiveMessage` with given parameters. In our case the `message` object.

That is pretty much how the server works.
