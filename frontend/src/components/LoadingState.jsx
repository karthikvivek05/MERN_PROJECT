const LoadingState = ({ label = "Loading" }) => {
  return (
    <div className="state-panel">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
};

export default LoadingState;
