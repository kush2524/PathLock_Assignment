import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  TextField,
  Tooltip,
  Snackbar,
  Tabs,
  Tab,
  Fade,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Avatar,
  Divider
} from "@mui/material";
import {
  Delete,
  CheckCircle,
  RadioButtonUnchecked,
  AddTask,
  Mood,
  TaskAlt
} from "@mui/icons-material";

interface TaskItem {
  id: string;
  description: string;
  isCompleted: boolean;
}

type Filter = "all" | "completed" | "active";

const API_URL = "http://localhost:5160/api/tasks";

const FILTER_TAB_MAP: { [key in Filter]: number } = {
  all: 0,
  active: 1,
  completed: 2,
};
const FILTER_KEYS: Filter[] = ["all", "active", "completed"];

const pastel = {
  bg: "#f3f8fd",
  card: "#fff",
  primary: "#747fe0",
  accent: "#a1c6fa",
  completed: "#cbe7ee",
  active: "#ffefd6",
  border: "#e7ecff",
  red: "#ff5b5b",
};

function App() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [desc, setDesc] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [snack, setSnack] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [tab, setTab] = useState(FILTER_TAB_MAP["all"]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) setTasks(JSON.parse(saved));
    else fetchTasks();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      setSnack({ open: true, message: "Unable to load tasks from server." });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    try {
      const res = await axios.post(API_URL, {
        description: desc,
        isCompleted: false,
        id: ""
      });
      setTasks([...tasks, res.data]);
      setDesc("");
      setSnack({ open: true, message: "Task added!" });
    } catch {
      setTasks([...tasks, { id: crypto.randomUUID(), description: desc, isCompleted: false }]);
      setDesc("");
      setSnack({ open: true, message: "Task added locally (server unavailable)" });
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      await axios.put(`${API_URL}/${id}`, {
        ...task,
        isCompleted: !task.isCompleted,
      });
      setTasks(tasks.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)));
      setSnack({ open: true, message: task.isCompleted ? "Marked as active" : "Marked as completed" });
    } catch {
      setTasks(tasks.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)));
      setSnack({ open: true, message: "Task updated locally (server unavailable)" });
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await axios.delete(`${API_URL}/${deleteDialog.id}`);
      setTasks(tasks.filter((t) => t.id !== deleteDialog.id));
      setSnack({ open: true, message: "Task deleted!" });
    } catch {
      setTasks(tasks.filter((t) => t.id !== deleteDialog.id));
      setSnack({ open: true, message: "Task deleted locally (server unavailable)" });
    }
    setDeleteDialog({ open: false, id: null });
  };

  const filtered = tasks.filter((t) =>
    filter === "all"
      ? true
      : filter === "completed"
      ? t.isCompleted
      : !t.isCompleted
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setFilter(FILTER_KEYS[newValue]);
  };

  return (
    <Fade in timeout={500}>
      <Box sx={{ minHeight: "100vh", bgcolor: pastel.bg, py: 7 }}>
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              mt: 5,
              borderRadius: 5,
              bgcolor: pastel.card,
              boxShadow: "0 4px 32px 8px #e8f0ff55",
              border: `1.5px solid ${pastel.border}`
            }}
          >
            <Stack alignItems="center" spacing={2} mb={1}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: pastel.primary }}>
                <AddTask sx={{ fontSize: 40, color: pastel.card }} />
              </Avatar>
              <Typography variant="h3" fontWeight={600} letterSpacing={2} color={pastel.primary} sx={{ my: 0.5, fontSize: { xs: 30, sm: 36, md: 42 } }}>
                MyTODOs
              </Typography>
              <Typography fontWeight={400} color="#758acd" mb={1}>
                Organize tasks effortlessly in a calm, beautiful UI.
              </Typography>
            </Stack>
            <form onSubmit={handleAdd} style={{ display: "flex", gap: 10, margin: "32px 0 18px 0" }}>
              <TextField
                label="Add a new task"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                variant="filled"
                sx={{
                  flex: 1,
                  bgcolor: pastel.bg,
                  borderRadius: 2,
                  input: { background: "none" },
                }}
                InputProps={{ disableUnderline: true }}
                autoFocus
              />
              <Tooltip title="Add Task">
                <span>
                  <Button
                    variant="contained"
                    sx={{
                      minWidth: 44,
                      p: 0,
                      borderRadius: 2,
                      bgcolor: pastel.primary,
                      color: "#fff",
                      fontWeight: 700,
                      boxShadow: "0 2px 12px #4765d323",
                      ":hover": {
                        bgcolor: pastel.accent,
                        color: pastel.primary,
                      }
                    }}
                    type="submit"
                    disabled={!desc.trim()}
                  >
                    <AddTask />
                  </Button>
                </span>
              </Tooltip>
            </form>
            <Box pb={2}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                centered
                sx={{ mb: 1, ".MuiTab-root": { fontWeight: 700 }, ".MuiTabs-indicator": { height: 4, borderRadius: 2 } }}
              >
                <Tab label="All" sx={{ minWidth: 90 }} />
                <Tab label="Active" sx={{ minWidth: 90 }} />
                <Tab label="Completed" sx={{ minWidth: 90 }} />
              </Tabs>
            </Box>
            <Divider sx={{ mb: 2, borderColor: pastel.border }} />
            <List>
              {filtered.length === 0 ? (
                <Stack alignItems="center" spacing={2} mt={6} mb={4}>
                  <Avatar
                    sx={{ width: 66, height: 66, bgcolor: pastel.accent, color: pastel.primary, mb: 1 }}>
                    <Mood sx={{ fontSize: 42 }} />
                  </Avatar>
                  <Typography fontWeight={500} color="#aac0e7">
                    No tasks {filter !== "all" && `in ${filter} view`}.
                  </Typography>
                </Stack>
              ) : (
                filtered.map((task, idx) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      background: task.isCompleted ? pastel.completed : pastel.active,
                      borderRadius: 3,
                      mb: 2,
                      px: 2.2,
                      py: 1.1,
                      boxShadow: task.isCompleted
                        ? "0 0px 12px #ccf1cd42"
                        : "0 2px 12px #fcd9c032",
                      border: `1.5px solid ${pastel.border}`,
                      transition: "0.27s cubic-bezier(.75,.13,.56,.92)",
                      ":hover": {
                        boxShadow: "0 7px 24px #d7dfff2a",
                        background: task.isCompleted ? "#d7f9db" : "#ffe6cf"
                      },
                    }}
                    disablePadding
                    secondaryAction={
                      <Stack direction="row" spacing={0.8}>
                        <Tooltip title={task.isCompleted ? "Mark as active" : "Mark as completed"}>
                          <IconButton
                            edge="end"
                            onClick={() => toggleTask(task.id)}
                            sx={{
                              color: task.isCompleted ? pastel.primary : pastel.primary,
                              background: task.isCompleted ? "#effae4" : "#e5e9fd;",
                              borderRadius: 2,
                              transition: "0.14s",
                              ":hover": {
                                bgcolor: "#ddebe5"
                              }
                            }}
                          >
                            {task.isCompleted ? (
                              <TaskAlt color="success" sx={{ fontSize: 22 }} />
                            ) : (
                              <RadioButtonUnchecked color="action" sx={{ fontSize: 22 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            edge="end"
                            onClick={() => confirmDelete(task.id)}
                            sx={{
                              color: pastel.red,
                              bgcolor: "#fff0f0",
                              borderRadius: 2,
                              transition: "0.14s",
                              ":hover": { bgcolor: "#ffeaea" }
                            }}
                          >
                            <Delete sx={{ fontSize: 22 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                  >
                    <ListItemText
                      sx={{
                        textDecoration: task.isCompleted ? "line-through" : undefined,
                        opacity: task.isCompleted ? 0.55 : 1,
                        color: task.isCompleted ? "#55826f" : "#314576",
                        fontWeight: task.isCompleted ? 400 : 600,
                        letterSpacing: 0.015,
                        fontSize: 19,
                      }}
                      primary={task.description}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Container>
        <Snackbar
          open={snack.open}
          autoHideDuration={2200}
          onClose={() => setSnack({ ...snack, open: false })}
          message={snack.message}
          ContentProps={{
            sx: { fontWeight: 600, fontSize: 17, borderRadius: 1.5, bgcolor: pastel.primary, color: "#fff" }
          }}
        />
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
            <Button color="error" onClick={handleDelete}>Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}

export default App;
