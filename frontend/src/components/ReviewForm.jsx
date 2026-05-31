import { useState } from "react";
import ErrorMessage from "./ErrorMessage.jsx";
import RatingRadio from "./RatingRadio.jsx";

const ReviewForm = ({ onSubmit, submitting }) => {
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!comment.trim()) {
      setError("Please add a review comment.");
      return;
    }

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    await onSubmit({ rating: Number(rating), comment });
    setComment("");
    setRating("");
  };

  return (
    <form className="form compact-form" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />
      <label>
        Rating
        <RatingRadio value={rating} onChange={setRating} />
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
