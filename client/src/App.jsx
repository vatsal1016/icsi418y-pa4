import CreateStory from "./CreateStory.jsx";
import Signup from "./Signup.jsx"; 
import Login from "./Login.jsx";
import Projects from "./Projects.jsx";
import "./App.css";

function App() {
  return (
    <main className="app">
      <h1>PA2 User Portal</h1>
      <p>Create an account or log in below.</p>

      <div className="forms">
        <Signup />
        <Login />
        
      </div>
      <Projects />
      <CreateStory />
    </main>
  );
}

export default App;






