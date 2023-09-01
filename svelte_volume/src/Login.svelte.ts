<script lang="ts">
  let username = '';
  let password = '';

  async function handleLogin() {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.token) {
      // Store token and navigate to dashboard
    } else {
      // Show error message
    }
  }
</script>

<div>
  <input type="text" placeholder="Username" bind:value={username} />
  <input type="password" placeholder="Password" bind:value={password} />
  <button on:click={handleLogin}>Login</button>
</div>
