import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer if the component is unmounted
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-blue-100">
      <div className="text-center">
        <div className="mb-4">
          <img
            src="/path-to-your-logo.png"
            alt="Paper2Digit Logo"
            className="mx-auto w-32 h-32"
          />
        </div>
        <div className="text-lg font-semibold text-gray-700">Paper2Digit</div>
        <div className="mt-2">
          <div className="flex items-center justify-center space-x-1 gap-3 text-sm text-gray-600">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-600 animate-ping"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-gray-600 animate-ping delay-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-gray-600 animate-ping delay-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
