require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = 9000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let users;
let projects;
let projectMemberships;
let userStories; 
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});


app.post("/signup", async (req, res) => {
  try {
    const { f_name, l_name, username, password } = req.body;

    if (!f_name || !l_name || !username || !password) {
      return res.status(400).json({
        message: "Please fill in every signup field.",
      });
    }

    const existingUser = await users.findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        message: "That username already exists.",
      });
    }

    await users.insertOne({ f_name, l_name, username, password });

    res.status(201).json({
      message: "Account created successfully.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Unable to create account. Please try again.",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Enter your username and password.",
      });
    }

    const user = await users.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({
        message: "Incorrect username or password.",
      });
    }

    res.json({
      message: `Login successful. Welcome, ${user.f_name}!`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Unable to log in. Please try again.",
    });
  }
});
app.get("/api/users", async (req, res) => {
  try {
    const registeredUsers = await users
  .find({})
  .project({ password: 0 })
  .toArray();

    res.json(registeredUsers);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Unable to get users.",
    });
  }
});
app.post("/api/projects", async (req, res) => {
  try {
    const { project_name, description, status, project_lead_id } = req.body;

    if (!project_name || !description || !status || !project_lead_id) {
      return res.status(400).json({
        message: "All project fields are required.",
      });
    }

    const leadId = new ObjectId(project_lead_id);

    const projectLead = await users.findOne({ _id: leadId });

    if (!projectLead) {
      return res.status(400).json({
        message: "Project Lead does not exist.",
      });
    }

    const project = {
      project_name,
      description,
      status,
      project_lead_id: leadId,
    };

    const result = await projects.insertOne(project);
    const projectId = result.insertedId;

    await projectMemberships.insertOne({
      project_id: projectId,
      user_id: leadId,
      role: "Project Lead",
    });

    res.status(201).json({
      message: "Project created successfully.",
      project_id: projectId,
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Unable to create project.",
    });
  }
});
app.get("/api/projects", async (req, res) => {
  try {
    const projectList = await projects.find({}).toArray();
    res.json(projectList);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Unable to get projects.",
    });
  }
});
app.get("/api/projects/:projectId/members", async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!ObjectId.isValid(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    const projectObjectId = new ObjectId(projectId);

    const project = await projects.findOne({
      _id: projectObjectId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    const memberships = await projectMemberships
      .find({ project_id: projectObjectId })
      .toArray();

    res.json(memberships);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Unable to get project members.",
    });
  }
});

app.post("/api/projects/:projectId/members", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id } = req.body;

    // Check that both IDs are valid
    if (!ObjectId.isValid(projectId) || !ObjectId.isValid(user_id)) {
      return res.status(400).json({
        message: "Invalid project or user ID.",
      });
    }

    const projectObjectId = new ObjectId(projectId);
    const userObjectId = new ObjectId(user_id);

    // Check that the project exists
    const project = await projects.findOne({
      _id: projectObjectId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    // Check that the user exists
    const user = await users.findOne({
      _id: userObjectId,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Check for duplicate membership
    const existingMembership = await projectMemberships.findOne({
      project_id: projectObjectId,
      user_id: userObjectId,
    });

    if (existingMembership) {
      return res.status(409).json({
        message: "User is already a member of this project.",
      });
    }

    // Create membership
    await projectMemberships.insertOne({
      project_id: projectObjectId,
      user_id: userObjectId,
      role: "Member",
    });

    res.status(201).json({
      message: "Project member added successfully.",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Unable to add project member.",
    });
  }
});
app.delete("/api/projects/:projectId/members/:userId", async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    if (!ObjectId.isValid(projectId) || !ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid project or user ID.",
      });
    }

    const projectObjectId = new ObjectId(projectId);
    const userObjectId = new ObjectId(userId);

    const project = await projects.findOne({
      _id: projectObjectId,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    const user = await users.findOne({
      _id: userObjectId,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Project Lead cannot be removed
    if (String(project.project_lead_id) === String(userObjectId)) {
      return res.status(409).json({
        message: "Project Lead cannot be removed.",
      });
    }
    
const assignedStory = await userStories.findOne({
  project_id: projectObjectId,
  assigned_user_id: userObjectId
});

if (assignedStory) {
  return res.status(409).json({
    message: "Reassign, unassign, or delete this member's stories before removing them from the project."
  });
}
    const result = await projectMemberships.deleteOne({
      project_id: projectObjectId,
      user_id: userObjectId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Project membership not found.",
      });
    }

    res.status(200).json({
      message: "Project member removed successfully.",
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Unable to remove project member.",
    });
  }
});

app.post("/api/projects/:projectId/stories", async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check project ID
    if (!isValidId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    // Check project exists
    const project = await findProject(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    // Validate story fields
    const error = validateStoryData(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const { title, description, priority, assigned_user_id } = req.body;

    if (assigned_user_id === undefined) {
      return res.status(400).json({
        message: "Assigned user field is required. Use null for Unassigned.",
      });
    }

    // Check assigned user
    const assignment = await validateAssignedUser(
      projectId,
      assigned_user_id
    );

    if (!assignment.valid) {
      return res.status(400).json({
        message: assignment.message,
      });
    }

    // Build the document using only allowed fields
    const newStory = {
      project_id: new ObjectId(projectId),
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "To Do",
      assigned_user_id: assignment.userId,
    };

    // Save to MongoDB
    const result = await userStories.insertOne(newStory);

    return res.status(201).json({
      message: "User story created successfully.",
      story: {
        ...newStory,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Unable to create user story.",
    });
  }
});

// PA4 - User Stories API Plan
//
// GET /api/projects/:projectId/stories
// Get all stories for one project.
//
// POST /api/projects/:projectId/stories
// Create a new story for a project.
//
// PUT /api/projects/:projectId/stories/:storyId
// Update a story's title, description, priority,
// status, and assigned member.
//
// DELETE /api/projects/:projectId/stories/:storyId
// Delete a story from a project.
//
// Responses:
// GET: array of stories
// POST: created story
// PUT: JSON success or error message
// DELETE: JSON success or error message
//
// The project ID comes from the URL.
// It cannot be changed when editing a story.

// PA4 - Step 4: Validate Input and Identifiers

const priorities = ["High", "Medium", "Low"];
const storyStatuses = ["To Do", "In Progress", "Done"];

// Check title, description, priority, and status
function validateStoryData(data, isEdit = false) {
  const { title, description, priority, status } = data;

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    !title.trim() ||
    !description.trim()
  ) {
    return "Title and description are required.";
  }

  if (!priorities.includes(priority)) {
    return "Priority must be High, Medium, or Low.";
  }

  if (isEdit && !storyStatuses.includes(status)) {
    return "Status must be To Do, In Progress, or Done.";
  }

  return null;
}

// Check if a MongoDB ID is valid
function isValidId(id) {
  return (
    typeof id === "string" &&
    /^[0-9a-fA-F]{24}$/.test(id) &&
    ObjectId.isValid(id)
  );
}

// Check if a project exists
async function findProject(projectId) {
  if (!isValidId(projectId)) {
    return null;
  }

  return await projects.findOne({
    _id: new ObjectId(projectId),
  });
}

// Check if a story exists in the selected project
async function findStory(projectId, storyId) {
  if (!isValidId(projectId) || !isValidId(storyId)) {
    return null;
  }

  return await userStories.findOne({
    _id: new ObjectId(storyId),
    project_id: new ObjectId(projectId),
  });
}
app.put("/api/projects/:projectId/stories/:storyId", async (req, res) => {
  try {
    const { projectId, storyId } = req.params;

    if (
      !ObjectId.isValid(projectId) ||
      !ObjectId.isValid(storyId)
    ) {
      return res.status(400).json({
        message: "Invalid project or story ID."
      });
    }

    const projectObjectId = new ObjectId(projectId);
    const storyObjectId = new ObjectId(storyId);

    const {
      title,
      description,
      priority,
      status,
      assigned_user_id
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "Title and description are required."
      });
    }

    if (!["High", "Medium", "Low"].includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority."
      });
    }

    if (!["To Do", "In Progress", "Done"].includes(status)) {
      return res.status(400).json({
        message: "Invalid story status."
      });
    }

    const storyQuery = {
      _id: storyObjectId,
      project_id: projectObjectId
    };

    const existingStory = await userStories.findOne(storyQuery);

    if (!existingStory) {
      return res.status(404).json({
        message: "Story not found in this project."
      });
    }

    const assignment = await validateAssignedUser(
      projectId,
      assigned_user_id == null || assigned_user_id === ""
        ? null
        : assigned_user_id
    );

    if (!assignment.valid) {
      return res.status(400).json({
        message: assignment.message
      });
    }

    const updates = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assigned_user_id: assignment.userId
    };

    const result = await userStories.updateOne(
      storyQuery,
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Story not found."
      });
    }

    res.json({
      message: "Story updated successfully."
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Unable to update story."
    });
  }
});
app.delete("/api/projects/:projectId/stories/:storyId", async (req, res) => {
  try {
    const { projectId, storyId } = req.params;

    if (
      !ObjectId.isValid(projectId) ||
      !ObjectId.isValid(storyId)
    ) {
      return res.status(400).json({
        message: "Invalid project or story ID."
      });
    }

    const result = await userStories.deleteOne({
      _id: new ObjectId(storyId),
      project_id: new ObjectId(projectId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Story not found in this project."
      });
    }

    res.status(200).json({
      message: "Story deleted successfully."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to delete story."
    });
  }
});
// Validate the assigned user and project membership
async function validateAssignedUser(projectId, assignedUserId) {
  if (assignedUserId === null) {
    return { valid: true, userId: null };
  }

  if (!isValidId(projectId) || !isValidId(assignedUserId)) {
    return { valid: false, message: "Invalid assigned user ID." };
  }

  const userId = new ObjectId(assignedUserId);
  const projectObjectId = new ObjectId(projectId);

  const user = await users.findOne({ _id: userId });

  if (!user) {
    return { valid: false, message: "Assigned user does not exist." };
  }

  const membership = await projectMemberships.findOne({
    project_id: projectObjectId,
    user_id: userId,
  });

  if (!membership) {
    return {
      valid: false,
      message: "Assigned user is not a member of this project.",
    };
  }

  return { valid: true, userId };
}
// PA4 - Get user stories for a project
app.get("/api/projects/:projectId/stories", async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!isValidId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID."
      });
    }

    const projectObjectId = new ObjectId(projectId);

    const project = await projects.findOne({
      _id: projectObjectId
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found."
      });
    }

    const stories = await userStories
      .find({ project_id: projectObjectId })
      .toArray();

    res.json(stories);

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Unable to get user stories."
    });
  }
});
async function startServer() {
  await client.connect();

  const database = client.db("pa2_database");
  users = database.collection("users");
  projects = database.collection("Projects");
  projectMemberships = database.collection("ProjectMemberships");
  userStories = database.collection("UserStories");
  await users.createIndex({ username: 1 }, { unique: true });

  console.log("Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Database connection failed:", error.message);
});
