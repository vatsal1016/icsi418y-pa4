function ProjectMembers({
  users,
  members,
  selectedUser,
  setSelectedUser,
  handleAddMember,
  handleRemoveMember,
}) {
  return (
    <div>
      <h4>Project Members</h4>

      <div>
        <select
          value={selectedUser}
          onChange={(event) => setSelectedUser(event.target.value)}
        >
          <option value="">Select a User</option>

          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.username}
            </option>
          ))}
        </select>

        <button type="button" onClick={handleAddMember}>
          Add Member
        </button>
      </div>

      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        members.map((membership) => {
          const memberUser = users.find(
            (user) => String(user._id) === String(membership.user_id)
          );

          return (
            <p key={membership._id}>
              {memberUser ? memberUser.username : "Unknown"} -{" "}
              {membership.role}

              {membership.role !== "Project Lead" && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(membership.user_id)}
                >
                  Remove
                </button>
              )}
            </p>
          );
        })
      )}
    </div>
  );
}

export default ProjectMembers;
