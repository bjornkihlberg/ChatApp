open System
open System.IO
open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.AspNetCore.SignalR
open Microsoft.Extensions.DependencyInjection
open Giraffe

let endpoints = choose []

let mutable msgs: (string * string * string)[] = [||]

type MyHub() =
    inherit Hub()
    member __.PostMessage(user: string, msg: string): Unit =
        msgs <- Array.truncate 5 [| yield Guid.NewGuid().ToString(), user, msg; yield! msgs |]
        __.Clients.All.SendAsync("receiveMessages", msgs) |> ignore

let configureApp (app: IApplicationBuilder): unit =
    app.UseDefaultFiles()
       .UseStaticFiles()
       .UseSignalR(fun routes -> routes.MapHub<MyHub>(PathString "/myhub"))
       .UseGiraffe endpoints

let configureServices (services: IServiceCollection): unit =
    services.AddGiraffe()
            .AddSignalR() |> ignore

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
