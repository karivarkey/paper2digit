import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import app from "../../firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = () => {
    const auth = getAuth(app);

    toast
      .promise(signInWithEmailAndPassword(auth, email, password), {
        loading: "Logging In",
        success: "Got the data",
        error: "Error when fetching",
      })
      .then(() => {
        navigate("/home");
      });
  };

  const handleGoogleLogin = () => {
    const auth = getAuth(app);

    const provider = new GoogleAuthProvider();

    toast
      .promise(signInWithPopup(auth, provider), {
        loading: "Logging In",
        success: "Got the data",
        error: "Error when fetching",
      })
      .then(() => {
        navigate("/home");
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Paper2Digit Login
        </h2>
        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="button"
              onClick={handleLogin}
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Log in
            </button>
          </div>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-full px-4 py-2 font-medium text-gray-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
              className="w-5 h-5 mr-2"
            />
            Log in with Google
          </button>
        </div>
        <div className="text-sm text-center text-gray-500">
          New here?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </div>
      </div>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: "",
          duration: 5000,
          style: {
            background: "#363636",
            color: "#fff",
          },

          // Default options for specific types
          success: {
            duration: 3000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
    </div>
  );
};

export default LoginPage;
