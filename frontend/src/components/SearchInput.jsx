import React from "react";
import styled from "styled-components";
import { Search } from "lucide-react";

const SearchInput = ({
  value,
  onChange,
  name = "text",
  placeholder = " Search products",
  ...rest
}) => {
  return (
    <StyledWrapper>
      <div className="input-wrapper">
        <span className="search-icon" aria-hidden="true">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder={placeholder}
          name={name}
          className="input"
          value={value}
          onChange={onChange}
          {...rest}
        />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .input-wrapper {
    position: relative;
    display: inline-block;
    margin-left: 50px;
  }

  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #777;
    pointer-events: none;
  }

  .input-wrapper .input {
    background-color: #ffffff;
    border: none;
    padding: 10px 10px 10px 2.6rem;
    font-size: 1rem;
    width: 13em;
    border-radius: 1rem;
    color: #555;
    box-shadow: 0 0.4rem #dfd9d9;
    cursor: text;
  }

  .input-wrapper .input:focus {
    outline: 2px solid lightcoral;
    outline-offset: 2px;
  }
`;

export default SearchInput;
