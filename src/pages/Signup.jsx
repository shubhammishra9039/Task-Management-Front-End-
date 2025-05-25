import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import OAuth from "../components/OAuth";

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

const createUser = async (userData) => {
  const { data } = await axios.post(`${baseURL}/api/v1/user/signup`, userData);
  return data;
};

const signupSchema = z
  .object({
    firstname: z.string().min(1, "first name is required"),
    lastname: z.string().min(1, "last name is required"),
    email: z.string().email("invalid email address"),
    password: z.string().min(8, "password atleast should be of 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "confirm password atleast should be of 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function Signup() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(signupSchema),
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      // Dispatch the user data to Redux store
      dispatch(setCredentials(data));
      queryClient.setQueryData(["user"], data);
      toast.success("Signup successful");
      navigate("/");
    },
    onError: (error) => {
      console.log(error,"this is");
      toast.error(
        error.response?.data?.message || "An error occurred during signup"
      );
    },
  });

  const signup = (data) => {
    console.log(data,"User Data");
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
      <h2 className="text-3xl font-extrabold text-blue-700 mb-8 text-center">
        Create your account
      </h2>
      <form onSubmit={handleSubmit(signup)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            First Name
          </label>
          <input
            placeholder="First Name"
            {...register("firstname")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {errors.firstname && (
            <p className="text-red-600 text-sm mt-1">{errors.firstname.message}</p>
          )}
        </div>
  
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Last Name
          </label>
          <input
            placeholder="Last Name"
            {...register("lastname")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {errors.lastname && (
            <p className="text-red-600 text-sm mt-1">{errors.lastname.message}</p>
          )}
        </div>
  
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
  
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="Create password"
            {...register("password")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
  
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Confirm password"
            {...register("confirmPassword")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
  
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-semibold rounded-lg py-3 hover:bg-blue-700 active:bg-blue-800 transition duration-200 disabled:opacity-60"
        >
          {isSubmitting ? "Signing up..." : "Sign Up"}
        </button>
      </form>
  
      <p className="mt-6 text-center text-gray-600 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Login
        </Link>
      </p>
  
      <div className="mt-8">
        <OAuth title="Sign up with Google" />
      </div>
    </div>
  </div>
  
  
  );
}

export default Signup;
