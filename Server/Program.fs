open System
open System.IO
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.DependencyInjection
open Giraffe

let endpoints = choose []

let configureApp (app: IApplicationBuilder): unit =
    app.UseDefaultFiles()
       .UseStaticFiles()
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
