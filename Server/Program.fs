open System.IO
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.DependencyInjection
open Giraffe

let endpoints = choose []

type Startup() =
    member __.ConfigureServices (services: IServiceCollection): unit =
        services.AddGiraffe() |> ignore
    
    member __.Configure (app: IApplicationBuilder): unit =
        app
            .UseDefaultFiles()
            .UseStaticFiles()
            .UseGiraffe endpoints

[<EntryPoint>]
let main _ =
    let publicPath = Path.GetFullPath "./public"

    WebHostBuilder()
        .UseKestrel()
        .UseWebRoot(publicPath)
        .UseContentRoot(publicPath)
        .UseStartup<Startup>()
        .Build()
        .Run()
    0 // return an integer exit code
