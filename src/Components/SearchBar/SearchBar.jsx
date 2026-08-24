import css from "./SearchBar.module.css";

function SearchBar({ value, onChange }) {
  return (
    <div className={css.searchContainer}>
      <img className={css.searchIcon} src="/icons/search.svg" alt="" />
      <input
        type="search"
        value={value}
        id="catalog-search"
        className={css.searchInput}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search..."
        autoComplete="off"
      />
    </div>
  );
}

export default SearchBar;
