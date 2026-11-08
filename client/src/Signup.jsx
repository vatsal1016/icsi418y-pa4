import { useState } from "react";

function Signup() {
  const [form, setForm] = useState({
    f_name: "",
    l_name: "",
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
      const response = await fetch("http://localhost:9000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setForm({
          f_name: "",
          l_name: "",
          username: "",
          password: "",
        });
      }
    } catch {
      setMessage("Cannot reach the server. Check that it is running.");
    }
  }

  return (
    <section>
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit}>
        <label>
          First name
          <input name="f_name" value={form.f_name} onChange={handleChange} />
        </label>

        <label>
          Last name
          <input name="l_name" value={form.l_name} onChange={handleChange} />
        </label>

        <label>
          Username
          <input name="username" value={form.username} onChange={handleChange} />
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

        <button type="submit">Create Account</button>
      </form>

      <p className="message">{message}</p>
    </section>
  );
}

export default Signup;
