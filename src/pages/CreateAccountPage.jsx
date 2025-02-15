import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";


const CreateAccountPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { email, password } = formData;

    try {
      // Create user in Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);

      // Sign the user out after creating the account
      await signOut(auth);

      setIsLoading(false);
      setSuccess("Account created successfully! Please login to continue.");
      setError(null);

      // Redirect to the login/signup page after a short delay
      setTimeout(() => navigate("/loginsignup"), 2000);
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
      setSuccess(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-grow items-center justify-center bg-gray-100 py-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
            Create Account
          </h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
            <p className="text-sm text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/loginsignup")}
              className="text-blue-500 hover:underline"
            >
              Sign Up
            </button>
          </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateAccountPage;
