function CreateProject({
  users,
  projectName,
  setProjectName,
  description,
  setDescription,
  status,
  setStatus,
  projectLead,
  setProjectLead,
  handleCreateProject,
}) {
  return (
    <>
      <h2>Projects</h2>

      <form onSubmit={handleCreateProject}>
        <div>
          <label>Project Name: </label>
          <input
            type="text"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
        </div>

        <div>
          <label>Description: </label>
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div>
          <label>Status: </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <div>
          <label>Project Lead: </label>
          <select
            value={projectLead}
            onChange={(event) => setProjectLead(event.target.value)}
          >
            <option value="">Select a Project Lead</option>

            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Create Project</button>
      </form>
    </>
  );
}

export default CreateProject;

