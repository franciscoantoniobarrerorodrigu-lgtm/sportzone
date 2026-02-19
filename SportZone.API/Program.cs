using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SportZone.API.Services;
using SportZone.API.Hubs;
using Supabase;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure Supabase Client
var supabaseUrl = builder.Configuration["Supabase:Url"]!;
var supabaseKey = builder.Configuration["Supabase:ServiceRoleKey"]!;

builder.Services.AddScoped<Client>(_ =>
{
    var options = new SupabaseOptions
    {
        AutoConnectRealtime = false,
        AutoRefreshToken = false
    };

    var client = new Client(supabaseUrl, supabaseKey, options);
    client.InitializeAsync().Wait();
    return client;
});

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Supabase:JwtSecret"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Configure Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("role", "admin"));
    options.AddPolicy("PlanilleroOnly", policy => policy.RequireClaim("role", "planillero"));
    options.AddPolicy("ArbitroOnly", policy => policy.RequireClaim("role", "arbitro"));
});

// Add SignalR
builder.Services.AddSignalR();

// Register Services
builder.Services.AddScoped<ILigaService, LigaService>();
builder.Services.AddScoped<IPartidosService, PartidosService>();
builder.Services.AddScoped<IGoleadoresService, GoleadoresService>();
builder.Services.AddScoped<ISignalRNotificationService, SignalRNotificationService>();
builder.Services.AddScoped<IFixtureGeneratorService, FixtureGeneratorService>();
builder.Services.AddScoped<ISuspensionManagerService, SuspensionManagerService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<ISolicitudesService, SolicitudesService>();
builder.Services.AddScoped<IResolucionesService, ResolucionesService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map SignalR Hubs
app.MapHub<PartidoHub>("/hubs/partido");

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }));

app.Run();
