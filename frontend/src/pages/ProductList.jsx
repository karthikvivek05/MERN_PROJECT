import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import api, { getErrorMessage } from "../services/api";

const ProductList = ({ title = "Products", compactIntro = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const queryString = searchParams.toString();

  const filters = useMemo(
    () => ({
      keyword: searchParams.get("keyword") || "",
      category: searchParams.get("category") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      rating: searchParams.get("rating") || "",
      sort: searchParams.get("sort") || "newest",
      page: searchParams.get("page") || "1"
    }),
    [queryString]
  );

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/products", { params: filters });
        setProducts(data.products);
        setCategories(data.categories);
        setPagination(data.pagination);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load products"));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [filters]);

  const updateFilter = (name, value) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }

    if (name !== "page") {
      next.set("page", "1");
    }

    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h1>{title}</h1>
          {!compactIntro && <p className="muted">Search, filter, and sort the full catalog.</p>}
        </div>
        <p className="muted">{pagination.total || 0} item(s)</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-title">
          <SlidersHorizontal size={18} aria-hidden="true" />
          <span>Filters</span>
        </div>
        <input
          value={filters.keyword}
          onChange={(event) => updateFilter("keyword", event.target.value)}
          placeholder="Keyword"
          aria-label="Keyword"
        />
        <select value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          value={filters.minPrice}
          onChange={(event) => updateFilter("minPrice", event.target.value)}
          placeholder="Min price"
          aria-label="Minimum price"
        />
        <input
          type="number"
          min="0"
          value={filters.maxPrice}
          onChange={(event) => updateFilter("maxPrice", event.target.value)}
          placeholder="Max price"
          aria-label="Maximum price"
        />
        <select value={filters.rating} onChange={(event) => updateFilter("rating", event.target.value)}>
          <option value="">Any rating</option>
          <option value="4">4+</option>
          <option value="3">3+</option>
          <option value="2">2+</option>
        </select>
        <select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
          <option value="newest">Newest</option>
          <option value="top-rated">Top rated</option>
          <option value="price-asc">Price low to high</option>
          <option value="price-desc">Price high to low</option>
        </select>
        <button className="secondary-button" type="button" onClick={clearFilters}>
          Reset
        </button>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingState label="Loading products" />
      ) : products.length ? (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard product={product} key={product._id} />
            ))}
          </div>
          <div className="pagination">
            <button
              className="secondary-button"
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => updateFilter("page", String(pagination.page - 1))}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.pages || 1}
            </span>
            <button
              className="secondary-button"
              type="button"
              disabled={pagination.page >= pagination.pages}
              onClick={() => updateFilter("page", String(pagination.page + 1))}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">No products match these filters.</div>
      )}
    </section>
  );
};

export default ProductList;
