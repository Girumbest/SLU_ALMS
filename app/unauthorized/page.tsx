const UnauthorizedPage = () => {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
          <p className="text-gray-700">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  };
  
  export default UnauthorizedPage;
  