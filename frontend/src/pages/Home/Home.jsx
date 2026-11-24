import { useAuth } from '../../hooks/useAuth.js';

function Home() {
  const { user, logout } = useAuth();

  return (
    <main>
      <h1>ICHgram</h1>

      <h2>Welcome, {user?.fullName}!</h2>

      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>

      <button type="button" onClick={logout}>
        Log out
      </button>
    </main>
  );
}

export default Home;