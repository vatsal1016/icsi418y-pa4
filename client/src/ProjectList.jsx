import ProjectMembers from "./ProjectMembers";

function ProjectList({
  projects,
  users,
  selectedProject,
  setSelectedProject,
  fetchMembers,
  members,
  selectedUser,
  setSelectedUser,
  handleAddMember,
  handleRemoveMember,
}) {
  return (
    <div>
      <h3>Project List</h3>

      {projects.map((project) => {
        const lead = users.find(
          (user) =>
            String(user._id) === String(project.project_lead_id)
        );

        return (
          <div key={project._id}>
            <p>
              <strong>Project:</strong> {project.project_name}
            </p>

            <p>
              <strong>Description:</strong> {project.description}
            </p>

            <p>
              <strong>Status:</strong> {project.status}
            </p>

            <p>
              <strong>Project Lead:</strong>{" "}
              {lead ? lead.username : "Unknown"}
            </p>

            <button
              type="button"
              onClick={() => {
                setSelectedProject(project._id);
                fetchMembers(project._id);
              }}
            >
              View Members
            </button>

            {String(selectedProject) === String(project._id) && (
              <ProjectMembers
                users={users}
                members={members}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                handleAddMember={handleAddMember}
                handleRemoveMember={handleRemoveMember}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProjectList;
