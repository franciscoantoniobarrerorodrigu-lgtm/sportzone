// ============================================================
// SportZone Pro — .NET 8 Web API
// Program.cs — Entry Point & DI Configuration
// ============================================================

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SportZone.API.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Supabase Client ──────────────────────────────────────────
builder.Services.AddSingleton(provider =>
{
    var url = builder.Configuration["Supabase:Url"]!;
    var key = builder.Configuration["Supabase:AnonKey"]!;
    return new Supabase.Client(url, key, new Supabase.SupabaseOptions
    {
        AutoConnectRealtime = true  // Para live updates (partidos en vivo)
    });
});

// ── Servicios de Negocio ─────────────────────────────────────
builder.Services.AddScoped<ILigaService, LigaService>();
builder.Services.AddScoped<IGoleadoresService, GoleadoresService>();
builder.Services.AddScoped<IPartidosService, PartidosService>();
builder.Services.AddScoped<ISolicitudesService, SolicitudesService>();
builder.Services.AddScoped<IResolucionesService, ResolucionesService>();
builder.Services.AddScoped<IMarketingService, MarketingService>();

// ── JWT Auth (Supabase usa JWT) ──────────────────────────────
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var supabaseUrl = builder.Configuration["Supabase:Url"]!;
        options.Authority = $"{supabaseUrl}/auth/v1";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Supabase:JwtSecret"]!)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAuthorization(opts =>
{
    opts.AddPolicy("AdminOnly",   p => p.RequireClaim("role", "admin"));
    opts.AddPolicy("Marketing",   p => p.RequireClaim("role", "admin", "marketing"));
    opts.AddPolicy("PublicRead",  p => p.RequireAssertion(_ => true));
});

// ── SignalR para partidos en vivo ────────────────────────────
builder.Services.AddSignalR();

// ── CORS para Angular ────────────────────────────────────────
builder.Services.AddCors(o => o.AddPolicy("Angular", p =>
    p.WithOrigins(
        "http://localhost:4200",
        "https://sportzone.app",
        "https://sportzone-hdl8io6ja.vercel.app",
        "https://sportzone-web.vercel.app"
     )
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "SportZone Pro API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer"
    });
});

var app = builder.Build();

// Swagger siempre disponible para desarrollo
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SportZone Pro API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("Angular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<PartidoHub>("/hubs/partidos");  // SignalR Hub

app.Run();
