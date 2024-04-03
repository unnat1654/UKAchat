import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import UserInfo from "./pages/auth/UserInfo";
import ProfilePictureUpload from "./pages/auth/ProfilePictureUpload";
import CreateGroup from "./pages/CreateGroup";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile-info" element={<UserInfo />} />
        <Route
          path="/profile-picture-upload"
          element={<ProfilePictureUpload />}
        />
        <Route path="/create-group" element={<CreateGroup />} />
      </Routes>
    </div>
  );
}

export default App;
