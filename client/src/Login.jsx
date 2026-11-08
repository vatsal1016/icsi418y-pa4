
import { useState } from "react";

function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:9000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch {
      setMessage("Cannot reach the server. Check that it is running.");
    }
  }

  return (
    <section>
      <h2>Log In</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Log In</button>
      </form>

      <p className="message">{message}</p>
    </section>
  );
}

export default Login;
