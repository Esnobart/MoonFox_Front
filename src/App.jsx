import { useEffect } from "react";
import { useDispatch } from "react-redux";

import "./App.css";
import Filters from "./Filters/Filters.jsx";
import Header from "./Header/Header.jsx";
import { ToastContainer } from "react-toastify";
import { refreshUser } from "../redux/users/operations";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch]);

  return (
    <div>
      <Header />
      <Filters />
      <main>
        <p>ниче тут нет пока</p>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
