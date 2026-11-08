import { useEffect, useState } from "react";
import CreateProject from "./CreateProject";
import ProjectList from "./ProjectList";


function Projects() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectLead, setProjectLead] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const [selectedProject, setSelectedProject] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
 
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("http://localhost:9000/api/users");
        const data = await response.json();

        if (response.ok) {
          setUsers(data);
        } else {
          console.log("Could not load users.");
        }
      } catch (error) {
        console.log("Server could not be reached.");
      }
    }

    fetchUsers();
    async function fetchProjects() {
      try {
    const response = await fetch("http://localhost:9000/api/projects");
    const data = await response.json();

    if (response.ok) {
      setProjects(data);
    } else {
      console.log("Could not load projects.");
    }
  } catch (error) {
    console.log("Server could not be reached.");
  }
}

fetchProjects();

}, []);
  async function fetchMembers(projectId) {
  try {
    const response = await fetch(
      `http://localhost:9000/api/projects/${projectId}/members`
    );

    const data = await response.json();

    if (response.ok) {
      setMembers(data);
    } else {
      setMembers([]);
    }
  } catch (error) {
    console.log("Could not load project members.");
    setMembers([]);
  }
}  
  async function handleAddMember() {
  if (!selectedProject || !selectedUser) {
    setMessage("Please select a project and a user.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:9000/api/projects/${selectedProject}/members`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedUser,
        }),
      }
    );

    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      setSelectedUser("");
      fetchMembers(selectedProject);
    }
  } catch (error) {
    setMessage("Server could not be reached.");
  }
} 
  async function handleRemoveMember(userId) {
  if (!selectedProject) {
    setMessage("Please select a project.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:9000/api/projects/${selectedProject}/members/${userId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      fetchMembers(selectedProject);
    }
  } catch (error) {
    setMessage("Server could not be reached.");
  }
} 
  async function handleCreateProject(event) {
  event.preventDefault();

  const projectData = {
    project_name: projectName,
    description: description,
    status: status,
    project_lead_id: projectLead,
  };

  try {
    const response = await fetch("http://localhost:9000/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });

    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      setProjectName("");
      setDescription("");
      setStatus("");
      setProjectLead("");
    }
  } catch (error) {
    setMessage("Server could not be reached.");
  }
}
    return (
    <div>
      <CreateProject
        users={users}
        projectName={projectName}
        setProjectName={setProjectName}
        description={description}
        setDescription={setDescription}
        status={status}
        setStatus={setStatus}
        projectLead={projectLead}
        setProjectLead={setProjectLead}
        handleCreateProject={handleCreateProject}
      />

      {message && <p>{message}</p>}

      <ProjectList
        projects={projects}
        users={users}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        fetchMembers={fetchMembers}
        members={members}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleAddMember={handleAddMember}
        handleRemoveMember={handleRemoveMember}
      />
    </div>
  );
}

export default Projects;

