import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import DesignerDashboard from "./components/DesignerDashboard";
import UserDashboard from "./components/UserDashboard";
import Events from "./components/Events";
import VideoRecorder from "./components/VideoRecorder";
import VideoEditor from "./components/VideoEditor";
import LiveStreamer from "./components/LiveStreamer";
import LiveStreamViewer from "./components/LiveStreamViewer";
import ARModeling from "./components/ARModeling";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/designer" element={<DesignerDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/video-recorder" element={<VideoRecorder />} />
          <Route path="/video-editor" element={<VideoEditor />} />
          <Route path="/live-streamer" element={<LiveStreamer />} />
          <Route path="/live-stream/:streamId" element={<LiveStreamViewer />} />
          <Route path="/ar-modeling" element={<ARModeling />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
