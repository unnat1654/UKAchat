import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import UserInfo from "./pages/auth/UserInfo";
import ProfilePictureUpload from "./pages/auth/ProfilePictureUpload";
import CreateGroup from "./pages/CreateGroup";
import { Beforeunload } from "react-beforeunload";
import { useSocket } from "./context/socketContext";
import { useAuth } from "./context/authContext";

function App() {
  const socket = useSocket();
  const [auth, setAuth] = useAuth();
  const handleBeforeUnload = () => {
    localStorage.setItem("offline", true);
    if (auth?.token) {
      if (socket) {
        socket.emit("set-offline", auth?.token);
      }
    }
  };

  return (
    <Beforeunload onBeforeunload={handleBeforeUnload}>
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
    </Beforeunload>
  );
}

export default App;
