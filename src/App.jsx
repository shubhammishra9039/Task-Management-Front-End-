import { Outlet } from "react-router";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Notification from "./components/Notification/Notification";
import { useState } from "react";

function App() {
  const [showNotification, setShowNotification] = useState(true);

  const handleClose = () => {
    setShowNotification(false);
  };

  const message = "Welcome to Task Manager! Start organizing your day, tracking your progress, and achieving your goals with ease.";


  return (
    <div>
      {showNotification && (
        <Notification message={message} onClose={handleClose} />
      )}
      <ToastContainer />
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
