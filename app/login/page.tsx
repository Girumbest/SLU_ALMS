"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { ClipLoader } from 'react-spinners';
import Image from 'next/image'; // Import the Image component

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      const redirectPath = session?.user?.role === "HRAdmin" 
        ? "/admin" 
        : session?.user?.role === "Supervisor" 
          ? "/supervisor" 
          : "/";
      router.push(redirectPath);
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Don't redirect here - the useEffect will handle it when session changes
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100"> 
        <ClipLoader size={50} color={"#123abc"} />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100"> 
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"> 
        <div className="flex justify-center mb-6"> 
          <Image 
            src="/logo.png" 
            alt="Logo"
            width={100} // Adjust as needed
            height={100} // Adjust as needed
          />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2> 
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"> 
          <strong className="font-bold">Error: </strong> {error}
        </div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" 
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" 
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline flex justify-center items-center gap-2 transition-colors duration-200" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <ClipLoader size={18} color="white" />
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
