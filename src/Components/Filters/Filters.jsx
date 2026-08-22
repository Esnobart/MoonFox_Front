import { useState } from "react";

import css from "./Filters.module.css";

function Filters() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className={css.filtersContainer}>
      <div className={css.searchContainer}>
        <img className={css.searchIcon} src="icons/search.svg" alt="Search" />
        <input
          type="search"
          value={searchTerm}
          id="search"
          className={css.searchInput}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          autoComplete="off"
        />
      </div>
    </div>
  );
}

export default Filters;
