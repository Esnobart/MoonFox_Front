import axios from "axios";

import "./App.css";
import Filters from "./Filters/Filters.jsx";
import Header from "./Header/Header.jsx";

axios.defaults.baseURL = "";

function App() {
  return (
    <div>
      <Header />
      <Filters />
      <main>
        <p>ниче тут нет пока</p>
      </main>
    </div>
  );
}

export default App;
