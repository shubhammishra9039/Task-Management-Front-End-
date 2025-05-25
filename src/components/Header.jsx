import axios from "axios";
import Button from "./Button";
import { BiTask } from "react-icons/bi";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../redux/features/auth/authSlice";

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

const logoutUser = async () => {
  const { data } = await axios.post(`${baseURL}/api/v1/user/logout`);
  return data;
};

const Header = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userinfo = useSelector((state) => state.auth.userInfo);

  const isLoginPage = window.location.pathname === "/login";
  const isSignupPage = window.location.pathname === "/signup";

  const mutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(logout());
      queryClient.setQueryData(["user"]);
      toast.success("Logout successful");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "An error occurred during login"
      );
    },
  });

  return (
    <div className="bg-blue-700 shadow-md">
    <div className="max-w-7xl mx-auto flex justify-between items-center text-white px-6 py-4">
      {/* Logo & Title */}
      <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity duration-200">
        <BiTask className="text-4xl" />
        <span className="text-2xl font-bold tracking-wide select-none">Task Manager</span>
      </Link>
  
      {/* Auth Buttons */}
      <div className="flex gap-4">
        {!userinfo?.email ? (
          <>
            <Link to="/login">
              <Button
                className={`px-5 py-2 rounded-md font-semibold transition-colors duration-300 ${
                  isLoginPage ? "bg-white text-blue-700 shadow-lg" : "bg-transparent text-white hover:bg-white hover:text-blue-700"
                }`}
              >
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                className={`px-5 py-2 rounded-md font-semibold transition-colors duration-300 ${
                  isSignupPage ? "bg-white text-blue-700 shadow-lg" : "bg-transparent text-white hover:bg-white hover:text-blue-700"
                }`}
              >
                Signup
              </Button>
            </Link>
          </>
        ) : (
          <Button
            onClick={() => mutation.mutate()}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold shadow-md transition-colors duration-300"
          >
            Logout
          </Button>
        )}
      </div>
    </div>
  </div>
  
  );
};

export default Header;
