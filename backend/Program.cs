var builder = WebApplication.CreateBuilder(args);

// Allow the React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

var app = builder.Build();
app.UseCors("AllowFrontend");
app.MapControllers();
app.Run();
