/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { X, Edit, Eye, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setTasks,
  addTask,
  updateTask,
  removeTask,
} from "../redux/features/task/taskSlice";
import { logout } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

axios.defaults.withCredentials = true;

const API_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

const priorityBadgeColors = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};

const TaskDetailModal = ({ task, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8">
      <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Task Details</h2>
      <div className="space-y-4 text-gray-700">
        <p>
          <strong>Title:</strong> {task.title}
        </p>
        <p>
          <strong>Description:</strong> {task.description}
        </p>
        <p>
          <strong>Status:</strong> {task.status}
        </p>
        <p>
          <strong>Priority:</strong>{" "}
          <span
            className={`inline-block px-2 py-1 rounded-full text-sm font-semibold ${priorityBadgeColors[task.priority]}`}
          >
            {task.priority}
          </span>
        </p>
        <p>
          <strong>Due Date:</strong>{" "}
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
        </p>
      </div>
      <button
        onClick={onClose}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded font-semibold"
      >
        Close
      </button>
    </div>
  </div>
);

const EditTaskModal = ({ task, onSave, onClose }) => {
  const [editedTask, setEditedTask] = useState(task);

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Edit Task</h2>
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) =>
            setEditedTask({ ...editedTask, title: e.target.value })
          }
          placeholder="Title"
          className="w-full p-3 mb-5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={editedTask.description}
          onChange={(e) =>
            setEditedTask({ ...editedTask, description: e.target.value })
          }
          rows="4"
          placeholder="Description"
          className="w-full p-3 mb-5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex space-x-4 mb-5">
          <select
            value={editedTask.status}
            onChange={(e) =>
              setEditedTask({ ...editedTask, status: e.target.value })
            }
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <select
            value={editedTask.priority}
            onChange={(e) =>
              setEditedTask({ ...editedTask, priority: e.target.value })
            }
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <input
          type="date"
          value={editedTask.dueDate ? editedTask.dueDate.split("T")[0] : ""}
          onChange={(e) =>
            setEditedTask({ ...editedTask, dueDate: e.target.value })
          }
          className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-lg font-semibold"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 transition text-gray-900 px-6 py-3 rounded-lg font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const TrelloBoard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tasks = useSelector((state) => state.tasks.tasks);
  let color = "#3498db";

  const columns = {
    todo: {
      id: "todo",
      title: "TODO",
      tasks: tasks.filter((task) => task.status === "To Do"),
    },
    inProgress: {
      id: "inProgress",
      title: "IN PROGRESS",
      tasks: tasks.filter((task) => task.status === "In Progress"),
    },
    done: {
      id: "done",
      title: "DONE",
      tasks: tasks.filter((task) => task.status === "Done"),
    },
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const task = columns[source.droppableId].tasks[source.index];
    const updatedTask = {
      ...task,
      status:
        destination.droppableId === "inProgress"
          ? "In Progress"
          : destination.droppableId === "done"
          ? "Done"
          : "To Do",
    };

    try {
      const response = await axios.put(
        `${API_URL}/api/v1/tasks/${task._id}`,
        updatedTask
      );
      dispatch(updateTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const addNewTask = async () => {
    const newTask = {
      title: "New Task",
      description: "New Description",
      status: "To Do",
      priority: "Medium",
      dueDate: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await axios.post(`${API_URL}/api/v1/tasks`, newTask);
      dispatch(addTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/v1/tasks/${taskId}`);
      dispatch(removeTask(taskId));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/tasks/${updatedTask._id}`,
        updatedTask
      );
      dispatch(updateTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/tasks`);
        dispatch(setTasks(response.data));
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          dispatch(logout());
          navigate("/login");
        } else {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchTasks();
  }, [dispatch, navigate]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <h1 className="text-2xl font-semibold text-gray-700 text-center max-w-md px-4">
          Using Free Service for Hosting, Initial Loading Might Take Up to 40-50
          Seconds...
        </h1>
        <ClipLoader
          color={color}
          loading={loading}
          size={100}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  if (error)
    return (
      <div className="text-red-600 font-semibold text-center mt-10 text-lg">
        Error: {error}
      </div>
    );

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredColumns = {
    todo: {
      ...columns.todo,
      tasks: filteredTasks.filter((task) => task.status === "To Do"),
    },
    inProgress: {
      ...columns.inProgress,
      tasks: filteredTasks.filter((task) => task.status === "In Progress"),
    },
    done: {
      ...columns.done,
      tasks: filteredTasks.filter((task) => task.status === "Done"),
    },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        <button
          onClick={addNewTask}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
        >
          + Add Task
        </button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col sm:flex-row gap-6">
          {Object.values(filteredColumns).map((column) => (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-gray-50 rounded-lg shadow p-5 flex-1 min-h-[550px] flex flex-col"
                >
                  <h2 className="font-bold text-xl text-gray-800 mb-6 border-b pb-2">
                    {column.title}
                  </h2>
                  <div className="flex-grow overflow-auto space-y-4">
                    {column.tasks.length === 0 && (
                      <p className="text-gray-400 italic text-center mt-10">
                        No tasks here
                      </p>
                    )}
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-lg p-4 shadow-md border transition cursor-move select-none ${
                              snapshot.isDragging
                                ? "bg-blue-50 shadow-lg"
                                : "hover:shadow-lg"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {task.title}
                              </h3>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${priorityBadgeColors[task.priority]}`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                            <div className="flex justify-between items-center mt-4">
                              <small className="text-gray-500">
                                Due:{" "}
                                {task.dueDate
                                  ? new Date(task.dueDate).toLocaleDateString()
                                  : "No date"}
                              </small>
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => setViewTask(task)}
                                  title="View Details"
                                  className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => setEditTask(task)}
                                  title="Edit Task"
                                  className="p-2 rounded-full hover:bg-yellow-100 text-yellow-600 transition"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => deleteTask(task._id)}
                                  title="Delete Task"
                                  className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Modals */}
      {viewTask && (
        <TaskDetailModal task={viewTask} onClose={() => setViewTask(null)} />
      )}
      {editTask && (
        <EditTaskModal
          task={editTask}
          onSave={handleEditTask}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
};

export default TrelloBoard;
