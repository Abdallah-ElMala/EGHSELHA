using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using WebCarWash.Application.Interfaces;
using WebCarWash.Infrastructure.Data;
using WebCarWash.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Register controllers with JSON camelCase formatting
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Enable CORS for Front-End (React / Vite)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register the database context
builder.Services.AddDbContext<CarWashDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Application & Infrastructure Services
builder.Services.AddScoped<ITechnicianService, TechnicianService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();

// Register Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "EGhselha Tech Portal API",
        Version = "v1",
        Description = "Clean Architecture API for EGhselha Car Wash Technician Portal"
    });
});

var app = builder.Build();

// Seed initial data if DB is available
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<CarWashDbContext>();
    try
    {
        await DbInitializer.SeedAsync(context);
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Could not initialize/seed database on startup. Service fallback mock data will be used.");
    }
}

// Configure Swagger for development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Use CORS
app.UseCors("AllowAll");

app.UseAuthorization();
app.MapControllers();

app.Run();
