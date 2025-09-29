using System.ComponentModel.DataAnnotations;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(o => o.AddPolicy("ng", p => p.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseSwagger(); app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseCors("ng");

var tasks = new List<TaskItem>();
var nextId = 1;

var group = app.MapGroup("/api/tasks");

// listing
group.MapGet("/", () => Results.Ok(tasks));

// create
group.MapPost("/", (CreateTask dto) =>
{
	if (string.IsNullOrWhiteSpace(dto.Title)) return Results.BadRequest("Title required.");
	var t = new TaskItem(nextId++, dto.Title.Trim(), dto.Description, dto.DueDate, TaskStatus.Pending);
	tasks.Add(t);
	return Results.Created($"/api/tasks/{t.Id}", t);
});

// update record
group.MapPut("/{id:int}", (int id, UpdateTask dto) =>
{
	var i = tasks.FindIndex(x => x.Id == id);
	if (i < 0) return Results.NotFound();
	var current = tasks[i];
	var updated = current with
	{
		Title = dto.Title ?? current.Title,
		Description = dto.Description,
		DueDate = dto.DueDate,
		Status = dto.Status ?? current.Status
	};
	tasks[i] = updated;
	return Results.Ok(updated);
});

// update status
group.MapPatch("/{id:int}/status", (int id, TaskStatus status) =>
{
	var i = tasks.FindIndex(x => x.Id == id);
	if (i < 0) return Results.NotFound();
	tasks[i] = tasks[i] with { Status = status };
	return Results.Ok(tasks[i]);
});

// delete
group.MapDelete("/{id:int}", (int id) =>
{
	var removed = tasks.RemoveAll(x => x.Id == id) > 0;
	return removed ? Results.NoContent() : Results.NotFound();
});

app.Run();

record TaskItem(int Id, string Title, string? Description, DateTime? DueDate, TaskStatus Status);
enum TaskStatus { Pending, InProgress, Completed }
record CreateTask([Required] string Title, string? Description, DateTime? DueDate);
record UpdateTask(string? Title, string? Description, DateTime? DueDate, TaskStatus? Status);