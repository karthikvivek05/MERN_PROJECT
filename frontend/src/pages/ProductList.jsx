import { SlidersHorizontal, X } from "lucide-react";
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
      sort: searchParams.get("sort") || "newest",
      limit: searchParams.get("limit") || "50",
    }),
    [queryString],
  );

  // pendingFilters holds UI edits until the user clicks Apply
  const [pendingFilters, setPendingFilters] = useState(filters);
  const [minInput, setMinInput] = useState(filters.minPrice || "");
  const [maxInput, setMaxInput] = useState(filters.maxPrice || "");

  useEffect(() => {
    // sync pending filters when applied filters (from URL) change
    setPendingFilters(filters);
    setMinInput(filters.minPrice || "");
    setMaxInput(filters.maxPrice || "");
  }, [queryString]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        // loadProducts uses `filters` from URL
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

  const updatePending = (name, value) => {
    setPendingFilters((current) => {
      const next = { ...current, [name]: String(value) };
      return next;
    });
  };

  const clearPending = () => {
    const empty = {
      keyword: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      limit: "50",
    };
    setPendingFilters(empty);
    setMinInput("");
    setMaxInput("");
  };

  const applyFilters = () => {
    const next = new URLSearchParams();
    // only set params that have a non-empty value (except limit)
    if (pendingFilters.keyword) next.set("keyword", pendingFilters.keyword);
    if (pendingFilters.category) next.set("category", pendingFilters.category);
    const minVal = String(minInput || "");
    const maxVal = String(maxInput || "");
    if (minVal !== "") next.set("minPrice", minVal);
    if (maxVal !== "") next.set("maxPrice", maxVal);
    if (pendingFilters.sort) next.set("sort", pendingFilters.sort);
    if (pendingFilters.limit) next.set("limit", pendingFilters.limit);

    setSearchParams(next);

    // sync pendingFilters to reflect applied params so UI updates predictably
    const applied = {
      keyword: next.get("keyword") || "",
      category: next.get("category") || "",
      minPrice: next.get("minPrice") || "",
      maxPrice: next.get("maxPrice") || "",
      sort: next.get("sort") || "newest",
      limit: next.get("limit") || "50",
    };
    setPendingFilters(applied);
    setMobileFiltersOpen(false);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const pendingEqualsApplied = () => {
    if (String(pendingFilters.keyword || "") !== String(filters.keyword || ""))
      return false;
    if (
      String(pendingFilters.category || "") !== String(filters.category || "")
    )
      return false;
    if (String(minInput || "") !== String(filters.minPrice || "")) return false;
    if (String(maxInput || "") !== String(filters.maxPrice || "")) return false;
    if (String(pendingFilters.sort || "") !== String(filters.sort || ""))
      return false;
    if (String(pendingFilters.limit || "") !== String(filters.limit || ""))
      return false;

    return true;
  };

  const filtersInputs = (
    <>
      <select
        value={pendingFilters.category}
        onChange={(event) => updatePending("category", event.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <input
        type="text"
        inputMode="numeric"
        value={minInput}
        onChange={(e) => setMinInput(e.target.value)}
        placeholder="Min price"
        aria-label="Minimum price"
      />
      <input
        type="text"
        inputMode="numeric"
        value={maxInput}
        onChange={(e) => setMaxInput(e.target.value)}
        placeholder="Max price"
        aria-label="Maximum price"
      />
      <select
        value={pendingFilters.sort}
        onChange={(event) => updatePending("sort", event.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="top-rated">Top rated</option>
        <option value="price-asc">Price low to high</option>
        <option value="price-desc">Price high to low</option>
      </select>
      {pendingEqualsApplied() ? (
        <button
          className="secondary-button"
          type="button"
          onClick={clearFilters}
          disabled={!queryString}
        >
          Reset
        </button>
      ) : (
        <button
          className="secondary-button"
          type="button"
          onClick={applyFilters}
        >
          Apply
        </button>
      )}
    </>
  );

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <section className="stack">
      <div className="section-heading">
        <div>
          <h1>{title}</h1>
          {!compactIntro && (
            <p className="muted">Search, filter, and sort the full catalog.</p>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <p className="muted">{pagination.total || 0} item(s)</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-title">
          <span className="toolbar-icon-desktop">
            <SlidersHorizontal size={18} aria-hidden="true" />
          </span>

          {/* functional filters button — shown on mobile in the same spot */}
          <button
            type="button"
            className="icon-button filters-button"
            aria-label="Open filters"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal size={18} />
          </button>

          <span>Filters</span>
        </div>

        {/* Desktop / wide screens: show inputs inline */}
        <div className="toolbar-filters-desktop">{filtersInputs}</div>
      </div>

      {/* Mobile overlay panel */}
      {mobileFiltersOpen && (
        <div className="mobile-filters-overlay" role="dialog" aria-modal="true">
          <div className="mobile-filters-panel">
            <div className="mobile-filters-header">
              <strong>Filters</strong>
              <button
                className="icon-button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mobile-filters-body">{filtersInputs}</div>
          </div>
          <div
            className="mobile-filters-backdrop"
            onClick={() => setMobileFiltersOpen(false)}
          />
        </div>
      )}

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
          {/* Pagination removed: all products shown on a single page */}
        </>
      ) : (
        <div className="empty-state">No products match these filters.</div>
      )}
    </section>
  );
};

export default ProductList;
