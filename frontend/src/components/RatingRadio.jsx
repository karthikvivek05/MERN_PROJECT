import { Fragment, useState } from "react";
import styled from "styled-components";

const RatingRadio = ({ value = "", onChange }) => {
  const [hoveredValue, setHoveredValue] = useState("");

  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  const displayValue = hoveredValue || String(value || "");

  const getFillColor = (isFilled) => {
    if (!isFilled) return "#666";

    // Determine target score based on hover or selection
    const targetScore = Number(displayValue);

    // If currently hovering, show the darker "hover" colors
    if (hoveredValue) {
      if (targetScore === 5) return "#7951ac";
      if (targetScore === 4) return "#22885e";
      if (targetScore === 3) return "#9f7e18";
      if (targetScore === 2) return "#99542d";
      if (targetScore === 1) return "#a23c3c";
    }

    // If not hovering but selected, show the brighter "checked" colors
    if (targetScore === 5) return "#ab68ff";
    if (targetScore === 4) return "#19c37d";
    if (targetScore === 3) return "#eab308";
    if (targetScore === 2) return "#e06c2b";
    if (targetScore === 1) return "#ef4444";

    return "#ffa723"; // default fallback
  };

  const stars = [5, 4, 3, 2, 1];

  return (
    <StyledWrapper>
      <div className="rating" aria-label="Rating filter">
        {stars.map((star) => {
          const isFilled = Number(displayValue || 0) >= star;

          return (
            <Fragment key={star}>
              <input
                type="radio"
                id={`star${star}`}
                name="rate"
                value={star}
                checked={String(value) === String(star)}
                onChange={handleChange}
              />
              <label
                title={
                  star === 5
                    ? "Excellent!"
                    : star === 4
                      ? "Great!"
                      : star === 3
                        ? "Good"
                        : star === 2
                          ? "Okay"
                          : "Bad"
                }
                htmlFor={`star${star}`}
                onMouseEnter={() => setHoveredValue(String(star))}
                onMouseLeave={() => setHoveredValue("")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="1em"
                  viewBox="0 0 576 512"
                  style={{ fill: getFillColor(isFilled) }}
                >
                  <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
                </svg>
              </label>
            </Fragment>
          );
        })}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;

  .rating {
    display: inline-flex;
    flex-direction: row-reverse;
    align-items: center;
    gap: 4px;
  }

  .rating > label {
    cursor: pointer;
    font-size: 30px;
    line-height: 1;
  }

  .rating > input {
    display: none;
  }

  .rating > label > svg {
    transition: fill 0.2s ease;
  }
`;

export default RatingRadio;
