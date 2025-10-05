import { cookies } from "next/headers";
import { db } from "@/lib/db/inMemoryStore";

export default async function AdminPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? db.sessions.get(token) : null;
  const user = session ? [...db.users.values()].find((u) => u.id === session.userId) : null;

  return (
    <main className="p-6">
      {user ? (
        <>
          <h1 className="text-2xl mb-4">Welcome, {user.username}</h1>
          <p>You can manage posts here.</p>
        </>
      ) : (
        <p>Not logged in.</p>
      )}
    </main>
  );
}