// Home.jsx - Updated with unified backgrounds
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { articlesApi, categoriesApi } from "../services/api";
import ArticleCard from "../components/ArticleCard";
import {
  Eye,
  Calendar,
  User,
  Navigation,
  Facebook,
  Instagram,
  Sparkles,
  HandHelping,
  Flame,
  Zap,
  AlertTriangle,
  Apple,
  Smartphone,
  Megaphone,
  Newspaper,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { bs } from "date-fns/locale";
import sponzorImg from "../images/sponzor.png";
import sponzor2Img from "../images/sponzor2.png";
import sponzor3Img from "../images/sponzor3.png";
import teretnjaci from "../images/teretnjaci.png";

const Home = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [latestArticles, setLatestArticles] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [categoryArticles, setCategoryArticles] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredHovered, setFeaturedHovered] = useState(false);
  const [currentSponsor, setCurrentSponsor] = useState(0);

  const searchQuery = searchParams.get("search");
  const sponsors = [sponzorImg, sponzor2Img, sponzor3Img];

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSponsor((prev) => (prev + 1) % sponsors.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      if (searchQuery) {
        const response = await articlesApi.getAll({
          search: searchQuery,
          pageSize: 12,
        });
        setLatestArticles(response.data.data || response.data);
      } else {
        const catResponse = await categoriesApi.getAll();
        setCategories(catResponse.data.data || catResponse.data);

        const latestResponse = await articlesApi.getAll({
          page: 1,
          pageSize: 7,
        });
        setLatestArticles(latestResponse.data.data || latestResponse.data);

        const popularResponse = await articlesApi.getAll({
          page: 1,
          pageSize: 10,
        });
        const articlesData = popularResponse.data.data || popularResponse.data;
        const sorted = [...articlesData].sort(
          (a, b) => b.viewCount - a.viewCount
        );
        setPopularArticles(sorted.slice(0, 6));

        const categoryData = {};
        for (const cat of catResponse.data.data || catResponse.data) {
          const response = await articlesApi.getAll({
            category: cat.slug,
            pageSize: 3,
          });
          categoryData[cat.slug] = response.data.data || response.data;
        }
        setCategoryArticles(categoryData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (category) => {
    switch (category.toLowerCase()) {
      case "dojave":
        return "urgent";
      case "saobraćaj":
        return "warning";
      case "oglasi":
        return "promo";
      case "pomoć":
        return "success";
      case "vijesti":
        return "info";
      default:
        return "";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "dojave":
        return <AlertTriangle size={17} />;
      case "saobraćaj":
        return <Navigation size={17} />;
      case "vijesti":
        return <Newspaper size={17} />;
      case "oglasi":
        return <Megaphone size={17} />;
      case "pomoć":
        return <HandHelping size={17} />;
      default:
        return null;
    }
  };

  const getCategoryHeaderIcon = (categorySlug) => {
    switch (categorySlug.toLowerCase()) {
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
        return (
          <Newspaper size={24} style={{ color: "var(--text-secondary)" }} />
        );
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const featuredArticle = latestArticles[0];

  return (
    <>
      {!searchQuery && featuredArticle && (
        <section className="hero-section fade-in-up">
          <div className="container">
            <div
              className="featured-card gradient-border hover-lift"
              onClick={() => navigate(`/clanak/${featuredArticle.slug}`)}
              onMouseEnter={() => setFeaturedHovered(true)}
              onMouseLeave={() => setFeaturedHovered(false)}
              style={{
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                borderRadius: "1.5rem",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
                height: "400px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  height: "100%",
                }}
              >
                <img
                  src={featuredArticle.primaryImageUrl || "/placeholder.jpg"}
                  alt={featuredArticle.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                    transform: featuredHovered ? "scale(1.05)" : "scale(1)",
                  }}
                  onError={(e) => {
                    e.target.src = teretnjaci;
                    e.target.style.objectFit = "contain";
                    e.target.style.padding = "2rem";
                    e.target.style.background = "var(--bg-primary)";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)",
                    opacity: featuredHovered ? 0.9 : 0.7,
                    transition: "opacity 0.3s",
                  }}
                />
              </div>
              <div className="featured-overlay">
                <span
                  className={`badge ${getBadgeClass(
                    featuredArticle.categoryName
                  )}`}
                >
                  {getCategoryIcon(featuredArticle.categoryName)}
                  {featuredArticle.categoryName}
                </span>
                <h2
                  style={{
                    margin: "1rem 0",
                    fontSize: "2rem",
                    lineHeight: 1.2,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                    transition: "transform 0.3s",
                    transform: featuredHovered
                      ? "translateY(-5px)"
                      : "translateY(0)",
                  }}
                >
                  {featuredArticle.title}
                </h2>
                <div
                  className="meta-info"
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    alignItems: "center",
                    opacity: featuredHovered ? 1 : 0.9,
                    transition: "opacity 0.3s",
                  }}
                >
                  <span
                    className="meta-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <User size={16} />
                    {featuredArticle.authorName}
                  </span>
                  <span
                    className="meta-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Calendar size={16} />
                    {featuredArticle.publishedAt &&
                      format(
                        new Date(featuredArticle.publishedAt),
                        "d. MMM yyyy",
                        { locale: bs }
                      )}
                  </span>
                  <span
                    className="meta-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Eye size={16} />
                    {featuredArticle.viewCount}
                  </span>
                  {featuredHovered && (
                    <span
                      style={{
                        marginLeft: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "rgba(255,255,255,0.2)",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        backdropFilter: "blur(10px)",
                        fontSize: "0.9rem",
                        animation: "fadeInUp 0.3s ease-out",
                      }}
                    >
                      Pročitaj više
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        className="articles-section fade-in-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {searchQuery ? (
                <>
                  <Sparkles
                    size={24}
                    style={{
                      marginRight: "0.5rem",
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  />
                  Rezultati: "{searchQuery}"
                </>
              ) : (
                <>
                  <Zap
                    size={24}
                    style={{
                      marginRight: "0.5rem",
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  />
                  Najnovije objave
                </>
              )}
            </h2>
          </div>

          {latestArticles.length > 0 ? (
            <div className="articles-grid">
              {(searchQuery ? latestArticles : latestArticles.slice(1, 7)).map(
                (article, index) => (
                  <div
                    key={article.id}

                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ArticleCard article={article} />
                  </div>
                )
              )}
            </div>
          ) : (
            <div
              className="fade-in-up"
              style={{
                textAlign: "center",
                padding: "4rem 1rem",
                background: "var(--bg-primary)",
                borderRadius: "1rem",
                border: "2px dashed var(--border)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                {searchQuery ? "🔍" : "📭"}
              </div>
              <p style={{ color: "var(--text-primary)", fontSize: "1.1rem" }}>
                {searchQuery
                  ? "Nema rezultata pretrage."
                  : "Trenutno nema članaka za prikaz."}
              </p>
            </div>
          )}
        </div>
      </section>

      {!searchQuery && (
        <section
          className="fade-in-up"
          style={{
            background:
              "linear-gradient(135deg, rgba(24, 119, 242, 0.05) 0%, rgba(188, 24, 136, 0.05) 100%)",
            padding: "4rem 0",
            margin: "3rem 0",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="container">
            <div
              style={{
                textAlign: "center",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              <h2
                className="section-title"
                style={{ marginBottom: "1.5rem", fontSize: "2rem" }}
              >
                Pratite nas
              </h2>
              <p
                style={{
                  color: "var(--text-primary)",
                  marginBottom: "2.5rem",
                  fontSize: "1.1rem",
                }}
              >
                Budite u toku sa najnovijim dešavanjima u svijetu teretnog
                transporta
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="https://facebook.com/teretnjaci.ba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link hover-grow"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1.25rem 2.5rem",
                    background:
                      "linear-gradient(135deg, #1877f2 0%, #166fe5 100%)",
                    color: "white",
                    borderRadius: "0.75rem",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    transition: "all 0.3s",
                    boxShadow: "0 4px 20px rgba(24, 119, 242, 0.4)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Facebook size={28} />
                  Facebook
                </a>
                <a
                  href="https://instagram.com/teretnjaci.ba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link hover-grow"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "1.25rem 2.5rem",
                    background:
                      "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
                    color: "white",
                    borderRadius: "0.75rem",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    transition: "all 0.3s",
                    boxShadow: "0 4px 20px rgba(188, 24, 136, 0.4)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Instagram size={28} />
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {!searchQuery &&
        categories.map((category, categoryIndex) => {
          const articles = categoryArticles[category.slug] || [];
          if (articles.length === 0) return null;

          return (
            <section
              key={category.id}
              className="articles-section fade-in-up"
              style={{ animationDelay: `${categoryIndex * 0.1}s` }}
            >
              <div className="container">
                <div
                  className="section-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "2rem",
                  }}
                >
                  <h2
                    className="section-title"
                    style={{
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    {getCategoryHeaderIcon(category.slug)}
                    {category.name}
                  </h2>
                  <button
                    className="btn btn-secondary hover-grow"
                    onClick={() => navigate(`/kategorija/${category.slug}`)}
                    style={{
                      fontSize: "0.875rem",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "50px",
                      border: "none",
                      background:
                        "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontWeight: 600,
                      transition: "all 0.3s",
                    }}
                  >
                    Vidi sve →
                  </button>
                </div>
                <div className="articles-grid">
                  {articles.map((article, index) => (
                    <div
                      key={article.id}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ArticleCard article={article} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

      {!searchQuery && (
        <section
          className="fade-in-up"
          style={{
            background:
              "linear-gradient(135deg, rgba(24, 119, 242, 0.05) 0%, rgba(188, 24, 136, 0.05) 100%)",
            padding: "4rem 0",
            margin: "3rem 0",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="container">
            <div
              style={{
                textAlign: "center",
                maxWidth: "700px",
                margin: "0 auto",
              }}
            >
              <h2
                className="section-title"
                style={{ marginBottom: "1.5rem", fontSize: "2rem" }}
              >
                <Smartphone
                  size={28}
                  style={{
                    marginRight: "0.75rem",
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                />
                Preuzmite aplikaciju
              </h2>
              <p
                style={{
                  color: "var(--text-primary)",
                  marginBottom: "2.5rem",
                  fontSize: "1.1rem",
                  lineHeight: 1.6,
                }}
              >
                Budite uvijek informisani sa našom mobilnom aplikacijom.
                <br />
                Dostupno za iOS i Android uređaje.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <a
                  href="https://apps.apple.com/us/app/teretnjaci-ba/id6479563312"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-grow"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1.25rem 2.5rem",
                    background:
                      "linear-gradient(135deg, #000000 0%, #2d3748 100%)",
                    color: "white",
                    borderRadius: "1rem",
                    textDecoration: "none",
                    transition: "all 0.3s",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Apple size={32} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                      Preuzmite na
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                      App Store
                    </div>
                  </div>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.isicdev.teretnjaciba&hl=hr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-grow"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1.25rem 2.5rem",
                    background:
                      "linear-gradient(135deg, #34a853 0%, #0f9d58 100%)",
                    color: "white",
                    borderRadius: "1rem",
                    textDecoration: "none",
                    transition: "all 0.3s",
                    boxShadow: "0 4px 20px rgba(15, 157, 88, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                      Preuzmite na
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                      Google Play
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {!searchQuery && popularArticles.length > 0 && (
        <section
          className="articles-section fade-in-up"
          style={{ padding: "4rem 0", margin: "3rem 0" }}
        >
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <Flame
                  size={24}
                  style={{
                    marginRight: "0.5rem",
                    display: "inline-block",
                    verticalAlign: "middle",
                    color: "#ff6b6b",
                  }}
                />
                Popularno
              </h2>
            </div>
            <div className="articles-grid">
              {popularArticles.map((article, index) => (
                <div
                  key={article.id}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {!searchQuery && (
        <section
          className="fade-in-up"
          style={{
            background:
              "linear-gradient(135deg, rgba(24, 119, 242, 0.05) 0%, rgba(188, 24, 136, 0.05) 100%)",
            padding: "4rem 0",
            marginTop: "3rem",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <div className="container">
            <div
              style={{
                position: "relative",
                width: "100%",
                overflow: "hidden",
                padding: "2rem 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  animation: "scroll 25s linear infinite",
                  width: "max-content",
                }}
              >
                {/* First set of sponsors */}
                {sponsors.map((sponsor, index) => (
                  <div
                    key={`sponsor-${index}`}
                    style={{
                      flex: "0 0 auto",
                      margin: "0 3rem",
                      height: "80px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={sponsor}
                      alt={`Sponzor ${index + 1}`}
                      style={{
                        height: "80px",
                        width: "auto",
                        maxWidth: "200px",
                        objectFit: "contain",
                        filter: "grayscale(0)",
                        opacity: 0.9,
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.filter = "grayscale(0)";
                        e.target.style.opacity = "1";
                        e.target.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.filter = "grayscale(0)";
                        e.target.style.opacity = "0.9";
                        e.target.style.transform = "scale(1)";
                      }}
                      onError={(e) => {
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80"%3E%3Crect width="200" height="80" fill="%23cbd5e1"/%3E%3Ctext fill="%23475569" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" x="100" y="45"%3ESponzor%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                ))}

                {/* Duplicate set for seamless loop */}
                {sponsors.map((sponsor, index) => (
                  <div
                    key={`sponsor-duplicate-${index}`}
                    style={{
                      flex: "0 0 auto",
                      margin: "0 3rem",
                      height: "80px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={sponsor}
                      alt={`Sponzor ${index + 1}`}
                      style={{
                        height: "80px",
                        width: "auto",
                        maxWidth: "200px",
                        objectFit: "contain",
                        filter: "grayscale(0)",
                        opacity: 0.9,
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.filter = "grayscale(0)";
                        e.target.style.opacity = "1";
                        e.target.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.filter = "grayscale(0)";
                        e.target.style.opacity = "0.9";
                        e.target.style.transform = "scale(1)";
                      }}
                      onError={(e) => {
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80"%3E%3Crect width="200" height="80" fill="%23cbd5e1"/%3E%3Ctext fill="%23475569" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" x="100" y="45"%3ESponzor%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <style>
            {`
              @keyframes scroll {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
            `}
          </style>
        </section>
      )}
    </>
  );
};

export default Home;