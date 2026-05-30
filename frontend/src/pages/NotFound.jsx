import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="empty-state">
      <h1>Page not found</h1>
      <Link className="primary-button" to="/">
        Go home
      </Link>
    </section>
  );
};

export default NotFound;
