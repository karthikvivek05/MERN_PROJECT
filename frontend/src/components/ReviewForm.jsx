import { useState } from "react";
import ErrorMessage from "./ErrorMessage.jsx";

const ReviewForm = ({ onSubmit, submitting }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!comment.trim()) {
      setError("Please add a review comment.");
      return;
    }

    await onSubmit({ rating, comment });
    setComment("");
    setRating(5);
  };

  return (
    <form className="form compact-form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />
      <label>
        Rating
        <select value={rating} onChange={(event) => setRating(event.target.value)}>
          {[5, 4, 3, 2, 1].map((value) => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label>
        Comment
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows="4"
          placeholder="Share your experience"
        />
      </label>
      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
};

export default ReviewForm;
