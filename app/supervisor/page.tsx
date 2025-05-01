"use client"
import { useSession, signOut } from 'next-auth/react';

const DashboardPage = () => {
  const { data: session } = useSession();

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        {session && (
          <div>
            <p className="text-gray-700">Welcome, {session.user?.username}!</p>
            <p className="text-gray-700">Your role: {session.user?.role}</p>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
