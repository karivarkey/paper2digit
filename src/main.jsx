import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./components/splash/splash";
import LoginPage from "./components/login/login";
import SignupPage from "./components/signup/signup";
import HomePage from "./components/homePage/homePage";
import AddClassroom from "./components/addClassroom/addClassroom";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/newClass" element={<AddClassroom />} />
    </Routes>
  </BrowserRouter>
);
