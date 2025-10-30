using Microsoft.AspNetCore.Mvc;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private static readonly List<TaskItem> _tasks = new();

    [HttpGet]
    public ActionResult<IEnumerable<TaskItem>> GetTasks()
    {
        return Ok(_tasks);
    }

    [HttpPost]
    public ActionResult<TaskItem> AddTask([FromBody] TaskItem newTask)
    {
        if (string.IsNullOrWhiteSpace(newTask.Description))
            return BadRequest("Description is required.");

        newTask.Id = Guid.NewGuid();
        _tasks.Add(newTask);
        return CreatedAtAction(nameof(GetTasks), new { id = newTask.Id }, newTask);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateTask(Guid id, [FromBody] TaskItem updatedTask)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == id);
        if (task == null)
            return NotFound();

        task.Description = updatedTask.Description;
        task.IsCompleted = updatedTask.IsCompleted;
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteTask(Guid id)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == id);
        if (task == null)
            return NotFound();

        _tasks.Remove(task);
        return NoContent();
    }
}
