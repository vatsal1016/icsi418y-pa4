
import { useEffect, useState } from "react";

const API = "http://localhost:9000";

export default function CreateStory() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [message, setMessage] = useState("");
  const [stories, setStories] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [editingStory, setEditingStory] = useState(null);
  
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    assigned_user_id: ""
  });

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch(`${API}/api/projects`);
        if (!response.ok) throw new Error("Could not load projects.");
        setProjects(await response.json());
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadProjects();
  }, []);
  useEffect(() => {
  async function loadUsers() {
    try {
      const response = await fetch(`${API}/api/users`);

      if (!response.ok) {
        throw new Error("Could not load users.");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  loadUsers();
}, []); 
  useEffect(() => {
    let cancelled = false;
    setMembers([]);
    setStories([]);
    setSelectedMemberId("");
    setEditingStory(null);

    if (!projectId) return;

    async function loadProjectData() {
      try {
        const [membersResponse, storiesResponse] = await Promise.all([
          fetch(`${API}/api/projects/${projectId}/members`),
          fetch(`${API}/api/projects/${projectId}/stories`),
        ]);

        if (!membersResponse.ok) {
          throw new Error("Could not load project members.");
        }

        const memberData = await membersResponse.json();

        if (cancelled) return;

        setMembers(memberData);

        if (!storiesResponse.ok) {
          throw new Error("Could not load project stories.");
        }

        const storyData = await storiesResponse.json();

        if (cancelled) return;

        setStories(storyData);
      } catch (error) {
        if (!cancelled) {
          setMessage(error.message);
        }
      }
    }

    loadProjectData();

return () => {
  cancelled = true;
};
}, [projectId, refresh]); 
  function startEditing(story) {
  setEditingStory(story._id);

  setEditForm({
    title: story.title,
    description: story.description,
    priority: story.priority,
    status: story.status,
    assigned_user_id: story.assigned_user_id || ""
  });

  setMessage("");
}

function cancelEditing() {
  setEditingStory(null);
  setMessage("");
}

async function saveEdit(event) {
  event.preventDefault();

  try {
    const response = await fetch(
      `${API}/api/projects/${projectId}/stories/${editingStory}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...editForm,
          assigned_user_id: editForm.assigned_user_id || null
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Unable to update story.");
      return;
    }

    setEditingStory(null);
    setMessage("Story updated successfully.");
    setRefresh(value => value + 1);

  } catch (error) {
    setMessage("Cannot connect to the server.");
  }
}
    async function deleteStory(story) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${story.title}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/api/projects/${projectId}/stories/${story._id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to delete story.");
        return;
      }

      setEditingStory(null);
      setMessage("Story deleted successfully.");
      setRefresh((value) => value + 1);
    } catch (error) {
      setMessage("Cannot connect to the server.");
    }
  }
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!projectId) {
      setMessage("Please select a project.");
      return;
    }

    const assignedUserId =
      selectedMemberId === "" ? null : selectedMemberId;

    try {
      const response = await fetch(
        `${API}/api/projects/${projectId}/stories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            priority,
            assigned_user_id: assignedUserId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create story.");
        return;
      }

      setTitle("");
      setDescription("");
      setPriority("Medium");
      setSelectedMemberId("");
      setMessage("User story created successfully.");
      setRefresh((value) => value + 1);
    } catch {
      setMessage("Cannot connect to the server.");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "30px auto", padding: 20 }}>
      <h1>Project User Stories</h1>

      <label>Select Project</label>
      <select
        value={projectId}
        onChange={(event) => {
          setProjectId(event.target.value);
          setMessage("");
          setEditingStory(null);
        }}
        style={{ display: "block", width: "100%", marginBottom: 15 }} 
      >
        <option value="">Choose a project</option>
        {projects.map((project) => (
          <option key={project._id} value={project._id}>
            {project.project_name}
          </option>
        ))}
      </select>
      {!projectId && <p>Please select a project to view its stories.</p>}
      {projectId && (
        <>
          <h2>Create User Story</h2>

          <form onSubmit={handleSubmit}>
            <label>Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              style={{ display: "block", width: "100%", marginBottom: 12 }}
            />

            <label>Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              style={{ display: "block", width: "100%", marginBottom: 12 }}
            />

            <label>Priority</label>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              style={{ display: "block", width: "100%", marginBottom: 12 }}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <label>Assigned Member</label>
            <select
              value={selectedMemberId}
              onChange={(event) => setSelectedMemberId(event.target.value)}
              style={{ display: "block", width: "100%", marginBottom: 12 }}
            >
              <option value="">Unassigned</option>
              {members.map((membership) => {
              const user = users.find(
                (u) => u._id === membership.user_id
            );

            return (
             <option key={membership._id} value={membership.user_id}>
               {user ? user.username : membership.user_id}
             </option>
            );
          })}
              
            </select>

            <button type="submit" disabled={!projectId}>
              Create Story
            </button>
          </form>

          <h2>Project Backlog</h2>

{stories.length === 0 ? (
  <p>No stories in this project yet.</p>
) : (
  stories.map((story) => {
    const assignedUser = users.find(
      (user) => user._id === story.assigned_user_id
    );

    return (
      <div
        key={story._id}
        style={{
          border: "1px solid gray",
          padding: "12px",
          marginBottom: "12px",
          borderRadius: "5px",
          textAlign: "left",
        }}
      >
        <h3>{story.title}</h3>

        <p><strong>Description:</strong> {story.description}</p>

        <p><strong>Priority:</strong> {story.priority}</p>

        <p><strong>Status:</strong> {story.status}</p>

        <p>
          <strong>Assigned Member:</strong>{" "}
          {story.assigned_user_id
            ? assignedUser?.username || "Unknown user"
            : "Unassigned"}
        </p>
        <button
          type="button"
          onClick={() => startEditing(story)}
          style={{ marginTop: "10px" }}
        >
          Edit Story
        </button>
                <button
          type="button"
          onClick={() => deleteStory(story)}
          style={{ marginLeft: "10px" }}
        >
          Delete Story
        </button>
      </div>
    );
  })
)}
        </>
      )}
      {editingStory && (
  <form onSubmit={saveEdit}>
    <h2>Edit User Story</h2>

    <label>Title</label>
    <input
      value={editForm.title}
      onChange={(e) =>
        setEditForm({ ...editForm, title: e.target.value })
      }
      required
    />

    <label>Description</label>
    <textarea
      value={editForm.description}
      onChange={(e) =>
        setEditForm({ ...editForm, description: e.target.value })
      }
      required
    />

    <label>Priority</label>
    <select
      value={editForm.priority}
      onChange={(e) =>
        setEditForm({ ...editForm, priority: e.target.value })
      }
    >
      <option value="High">High</option>
      <option value="Medium">Medium</option>
      <option value="Low">Low</option>
    </select>

    <label>Status</label>
    <select
      value={editForm.status}
      onChange={(e) =>
        setEditForm({ ...editForm, status: e.target.value })
      }
    >
      <option value="To Do">To Do</option>
      <option value="In Progress">In Progress</option>
      <option value="Done">Done</option>
    </select>

    <label>Assigned Member</label>
    <select
      value={editForm.assigned_user_id}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          assigned_user_id: e.target.value,
        })
      }
    >
      <option value="">Unassigned</option>
      {members.map((membership) => {
        const user = users.find(
          (u) => u._id === membership.user_id
        );

        return (
          <option
            key={membership._id}
            value={membership.user_id}
          >
            {user ? user.username : membership.user_id}
          </option>
        );
      })}
    </select>

    <div style={{ marginTop: "15px" }}>
      <button type="submit">Save Changes</button>

      <button
        type="button"
        onClick={cancelEditing}
        style={{ marginLeft: "10px" }}
      >
        Cancel
      </button>
    </div>
  </form>
)}
      {message && <p role="status">{message}</p>}
    </div>
  );
}

