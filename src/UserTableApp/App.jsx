import React, { useReducer, Fragment, useState, useEffect } from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import styled from "styled-components";
import axios from "axios";
import UserTable from "./UserTable";

const checkboxes = [
  {
    id: "filter-username",
    name: "filter-username",
    pathFn: (user) => user.username,
    label: "Filter by Username",
  },

  {
    id: "filter-city",
    name: "filter-city",
    pathFn: (user) => user.address.city,
    label: "Filter by City",
  },

  {
    id: "filter-company",
    name: "filter-company",
    pathFn: (user) => user.company.name,
    label: "Filter by Company",
  },
];

const initialState = {
  filters: {},
  searchData: [],
  users: [],
};

const filterFn = (filters, query) => (item) => {
  const filterItem = (filterObj, data) =>
    Object.values(filterObj).reduce((acc, fn) => {
      acc.push(fn(data));
      return acc;
    }, []);

  return (
    filterItem(filters, item)
      .map((str) => str.toLowerCase())
      .join()
      .search(query) !== -1
  );
};

const reducer = (state, action) => {
  switch (action.type) {
    case "init": {
      return { ...state, searchData: action.payload, users: action.payload };
    }

    case "search": {
      const { searchData, filters } = state;
      const query = action.payload;

      if (!query) {
        return { ...state, users: searchData };
      }

      const filteredUsers = searchData.filter(filterFn(filters, query));
      return { ...state, users: filteredUsers };
    }

    case "add.filter": {
      const { name, pathFn } = action.payload;
      return { ...state, filters: { ...state.filters, [name]: pathFn } };
    }

    case "remove.filter": {
      const { [action.payload]: _, ...rest } = state.filters;
      return { ...state, filters: rest };
    }

    default:
      return state;
  }
};

// Create an action creator.
const init = (data) => ({type: 'init', payload: data});
const search = (query) => ({type: 'search', payload: query});
const addFilter = (name, pathFn) => ({type: 'add.filter', payload: {name, pathFn}});
const removeFilter = (name) => ({type: 'remove.filter', payload: name});
// Create the redux store.
const store = createStore(reducer, initialState);

export default function App() {
  return (
    <Provider store={store}>
      <UserTableApp />
    </Provider>
  );
}

function UserTableApp() {
  // Use useDispatch to get dispatch.
  // Use useSelector to get users information.
  const [query, setQuery] = useState("");
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.data)
      // Refactor to utilize the action creator.
      .then((data) => dispatch(init(data)));
  }, []);

  const handleReset = () => setQuery("");

  const handleChange = (e) => {
    const query = e.target.value;
    setQuery(query);
  };

  useEffect(() => {
    // Refactor to utilize the action creator.
    dispatch(search(query));
  }, [query]);

  const handleCheckboxChange = (pathFn) => (e) => {
    const name = e.target.name;
    if (e.target.checked)
      // Refactor to utilize the action creator.
      dispatch(addFilter(name, pathFn));
    // Refactor to utilize the action creator.
    else dispatch( removeFilter(name));
    dispatch(search(query))
  };

  const { users } = state;

  return (
    <Container>
      <div>
        <label htmlFor="search-query">Search</label>
        <input
          value={query}
          onChange={handleChange}
          id="search-query"
          type="text"
          name="search-query"
        />
        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </div>

      <CheckboxController>
        {checkboxes.map(({ id, name, pathFn, label }) => (
          <Fragment key={id}>
            <input
              type="checkbox"
              onChange={handleCheckboxChange(pathFn)}
              id={id}
              name={name}
            />
            <label htmlFor={id}>{label}</label>
          </Fragment>
        ))}
      </CheckboxController>

      <UserTable users={users} />
    </Container>
  );
}

const Container = styled.div`
  min-height: 600px;
`;

const CheckboxController = styled.div`
  padding: 8px 0;

  input:not(:first-of-type) {
    margin-left: 20px;
  }
`;
