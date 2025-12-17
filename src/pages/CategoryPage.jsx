import { useState, useEffect } from "react";
import { useParams, useSearchParams, useLocation } from "react-router-dom";
import { articlesApi, categoriesApi } from "../services/api";
import ArticleCard from "../components/ArticleCard";
import {
  Newspaper,
  AlertTriangle,
  HandHelping,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Megaphone,
} from "lucide-react";

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation(); // Added for route detection
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12;

  // Scroll to top when component mounts or slug/page changes
  useEffect(() => {
    // Immediate scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Additional fallbacks for browser compatibility
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // WebView compatibility
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SCROLL_TO_TOP' }));
    }
  }, [slug, currentPage, location.key]); // Added location.key to detect route changes

  useEffect(() => {
    loadCategoryData();
  }, [slug, currentPage]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);

      // Get categories using the fixed api.js
      const categoriesResponse = await categoriesApi.getAll();
      const categoriesData = categoriesResponse.data || [];
      
      const foundCategory = categoriesData.find((cat) => 
        (cat.slug || cat.Slug) === slug
      );
      setCategory(foundCategory || null);

      // Get articles
      const response = await articlesApi.getAll({
        category: slug,
        page: currentPage,
        pageSize: pageSize,
      });

      const responseData = response.data || [];
      const paginationData = response.pagination || {};

      setArticles(Array.isArray(responseData) ? responseData : []);
      setTotalArticles(paginationData.totalItems || responseData.length || 0);
      setTotalPages(
        paginationData.totalPages ||
          Math.ceil((paginationData.totalItems || responseData.length || 0) / pageSize) ||
          1
      );
    } catch (error) {
      console.error("Error loading category data:", error);
      setArticles([]);
      setCategory(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage.toString() });
      // This will be handled by the useEffect above when currentPage changes
    }
  };

  const getCategoryIcon = () => {
    if (!category) return null;

    const categorySlug = (category.slug || category.Slug || "").toLowerCase();
    try {
      switch (categorySlug) {
        case "vijesti":
          return <Newspaper size={32} style={{ color: "#3c8eba" }} />;
        case "saobracaj":
          return <Navigation size={32} style={{ color: "#f59e0b" }} />;
        case "pomoc":
          return <HandHelping size={32} style={{ color: "#10b981" }} />;
        case "dojave":
          return <AlertTriangle size={32} style={{ color: "#ef4444" }} />;
        case "oglasi":
          return <Megaphone size={32} style={{ color: "#aa69ba" }} />;
        default:
          return <Newspaper size={32} style={{ color: "var(--text-secondary)" }} />;
      }
    } catch (error) {
      console.error("Error in getCategoryIcon:", error);
      return <Newspaper size={32} style={{ color: "var(--text-secondary)" }} />;
    }
  };

  const getCategoryDescription = () => {
    if (!category) return "";

    const categorySlug = (category.slug || category.Slug || "").toLowerCase();
    try {
      switch (categorySlug) {
        case "saobracaj":
          return "Aktuelne informacije o saobraćajnoj situaciji, zatvaranjima puteva, radovima na putevima i važnim dojavama za vozače teretnih vozila.";
        case "pomoc":
          return "Potrebna Vam je pomoć na putu ili želite pomoći drugima? Ovdje možete pronaći sve relevantne informacije, kontakte i objave za pomoć u nevolji.";
        case "dojave":
          return "Najnovije dojave iz terena, informacije o kontrolama, graničnim prelazima i važne obavijesti za vozače teretnjaka.";
        case "vijesti":
          return "Sve aktuelne vijesti iz svijeta transporta, logistike, zakonskih promjena i događaja od značaja za teretni transport.";
        case "oglasi":
          return "Oglasi za prodaju i kupovinu teretnih vozila, traženje posla, transportnih usluga i sve ostalo što se tiče teretnog transporta.";
        default:
          return `Svi članci i objave iz kategorije ${category.name || category.Name || "ova"}`;
      }
    } catch (error) {
      console.error("Error in getCategoryDescription:", error);
      return `Svi članci i objave iz kategorije ${category.name || category.Name || "ova"}`;
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Učitavanje članaka...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div
        className="container"
        style={{ padding: "4rem 0", textAlign: "center" }}
      >
        <h1>Kategorija nije pronađena</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
          Tražena kategorija ne postoji ili je uklonjena.
        </p>
      </div>
    );
  }

  const startArticle = (currentPage - 1) * pageSize + 1;
  const endArticle = Math.min(currentPage * pageSize, totalArticles);

  return (
    <div className="fade-in-up">
      <section
        style={{
          background:
            "linear-gradient(135deg, var(--bg-secondary) 0%, rgba(74, 85, 104, 0.1) 100%)",
          padding: "4rem 0",
          marginBottom: "3rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            {getCategoryIcon()}
            <h1
              style={{
                fontSize: "2.5rem",
                margin: 0,
                color: "var(--text-primary)",
                fontWeight: 700,
              }}
            >
              {category.name || category.Name}
            </h1>
          </div>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
              maxWidth: "700px",
              lineHeight: 1.6,
            }}
          >
            {getCategoryDescription()}
          </p>
          <div
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.25rem",
              background: "var(--bg-card)",
              borderRadius: "0.5rem",
              display: "inline-block",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>
              Prikazano:{" "}
              <strong style={{ color: "var(--primary)" }}>
                {articles.length > 0 ? `${startArticle}-${endArticle}` : "0"}
              </strong>{" "}
              od{" "}
              <strong style={{ color: "var(--primary)" }}>
                {totalArticles}
              </strong>{" "}
              članaka
            </span>
          </div>
        </div>
      </section>

      <section className="articles-section">
        <div className="container">
          {articles.length > 0 ? (
            <>
              <div className="articles-grid">
                {articles.map((article, index) => (
                  <div
                    key={article.id || article.Id || index}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination-wrapper">
                  <div className="pagination-container">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`pagination-btn prev-btn ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <ChevronLeft size={18} />
                      <span className="btn-text">Prethodna</span>
                    </button>

                    <div className="page-numbers">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        const showPage =
                          totalPages <= 7 ||
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 &&
                            pageNum <= currentPage + 1);

                        const showEllipsis =
                          totalPages > 7 &&
                          ((pageNum === 2 && currentPage > 3) ||
                            (pageNum === totalPages - 1 &&
                              currentPage < totalPages - 2));

                        if (!showPage && !showEllipsis) return null;

                        if (showEllipsis) {
                          return (
                            <span
                              key={`ellipsis-${pageNum}`}
                              className="page-ellipsis"
                            >
                              ...
                            </span>
                          );
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`page-btn ${
                              pageNum === currentPage ? "active" : ""
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`pagination-btn next-btn ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <span className="btn-text">Sljedeća</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="fade-in-up"
              style={{
                textAlign: "center",
                padding: "6rem 2rem",
                background: "var(--bg-secondary)",
                borderRadius: "1.5rem",
                border: "2px dashed var(--border)",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>📭</div>
              <h2 style={{ marginBottom: "1rem" }}>
                Nema članaka u ovoj kategoriji
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                Trenutno nema objavljenih članaka u kategoriji "{category.name || category.Name}
                ".
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;