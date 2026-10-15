
import Home from "./components/Home";
import Blogs from "./components/Blogs";
import Navbar from "./components/common/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminDashboard from "./components/AdminDashboard";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import BlogDetails from "./components/BlogDetails";
import { AuthProvider } from "./contexts/AuthContext";
import About from "./components/About";
function App() {
  return (
    <div className="min-h-screen bg-white">
      <BrowserRouter>
        <AuthProvider>
          <Navbar />

          <Routes>
            <Route
              path="/"
              element={<Navigate to="/home" replace />}
            />

            <Route path="/home" element={<Home />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/blogs/:id" element={<BlogDetails />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

