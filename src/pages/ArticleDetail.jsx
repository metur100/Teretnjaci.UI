import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { articlesApi } from "../services/api";
import { format } from "date-fns";
import { bs } from "date-fns/locale";
import {
  Eye,
  Calendar,
  User,
  AlertTriangle,
  HandHelping,
  Megaphone,
  Navigation,
  Newspaper,
  ArrowLeft,
  Image as ImageIcon,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Check,
} from "lucide-react";

const ArticleDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState({});
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Scroll to top on component mount and when slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "SCROLL_TO_TOP" })
      );
    }
  }, [slug, location.key]);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await articlesApi.getBySlug(slug);
      setArticle(response.data || null);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
      }, 50);
    } catch (error) {
      console.error("Error loading article:", error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (imageId) => {
    setImageError((prev) => ({ ...prev, [imageId]: true }));
  };

  const getArticleProperty = (prop) => {
    if (!article) return "";
    return (
      article[prop] ||
      article[prop.charAt(0).toUpperCase() + prop.slice(1)] ||
      article[prop.toLowerCase()] ||
      ""
    );
  };

  const getBadgeClass = (category) => {
    if (!category) return "";

    try {
      const categoryName = String(category).toLowerCase();
      switch (categoryName) {
        case "dojave":
          return "urgent";
        case "saobraćaj":
        case "saobracaj":
          return "warning";
        case "oglasi":
          return "promo";
        case "pomoć":
        case "pomoc":
          return "success";
        case "vijesti":
          return "info";
        default:
          return "";
      }
    } catch (error) {
      console.error("Error in getBadgeClass:", error);
      return "";
    }
  };

  const getCategoryIcon = (category) => {
    if (!category) return null;

    try {
      const categoryName = String(category).toLowerCase();
      switch (categoryName) {
        case "dojave":
          return <AlertTriangle size={12} />;
        case "saobraćaj":
        case "saobracaj":
          return <Navigation size={12} />;
        case "vijesti":
          return <Newspaper size={12} />;
        case "oglasi":
          return <Megaphone size={12} />;
        case "pomoć":
        case "pomoc":
          return <HandHelping size={12} />;
        default:
          return null;
      }
    } catch (error) {
      console.error("Error in getCategoryIcon:", error);
      return null;
    }
  };

  const getShareUrl = () => {
    return `https://teretnjaci.ba/clanak/${slug}`;
  };

  const handleShare = async () => {
    const title = getArticleProperty("title");
    const url = getShareUrl();

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: title,
          url,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share error:", err);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert("Link je kopiran");
    } catch {
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <>
        <Helmet>
          <title>Članak nije pronađen - Teretnjaci.ba</title>
          <meta property="og:title" content="Teretnjaci.ba" />
          <meta
            property="og:image"
            content="https://i.ibb.co/wFNwCtMZ/441a68a4f946.png"
          />
          <meta
            name="description"
            content="Teretnjaci.ba - Vijesti, saobraćaj i pomoć"
          />
        </Helmet>
        <div
          className="container"
          style={{ padding: "4rem 1rem", textAlign: "center" }}
        >
          <h2 style={{ marginBottom: "1rem" }}>❌ Članak nije pronađen</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Članak koji tražite možda je premješten ili obrisan.
          </p>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={18} />
            Povratak na početnu
          </Link>
        </div>
      </>
    );
  }

  // Get article data
  const categoryName = getArticleProperty("categoryName");
  const categorySlug = getArticleProperty("categorySlug");
  const title = getArticleProperty("title");
  const authorName = getArticleProperty("authorName");
  const publishedAt = getArticleProperty("publishedAt");
  const viewCount = getArticleProperty("viewCount") || 0;
  const images = article.images || article.Images || [];
  const content = getArticleProperty("content");

  const primaryImage = images.find((img) => img.IsPrimary || img.isPrimary);
  const firstImage = images[0];
  const ogImage =
    primaryImage?.FilePath ||
    primaryImage?.Url ||
    firstImage?.FilePath ||
    firstImage?.Url ||
    "https://i.ibb.co/wFNwCtMZ/441a68a4f946.png";

  return (
    <div className="article-detail">
      {/* Dynamic Meta Tags for Social Sharing */}
      <Helmet>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:image" content={ogImage} />
        <meta
          name="description"
          content="Teretnjaci.ba - Vijesti, saobraćaj i pomoć"
        />
      </Helmet>

      <div className="article-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1rem",
          }}
        >
          <div>
            {categorySlug && (
              <Link to={`/kategorija/${categorySlug}`}>
                <span className={`badge ${getBadgeClass(categoryName)}`}>
                  {getCategoryIcon(categoryName)}
                  {categoryName}
                </span>
              </Link>
            )}
            {!categorySlug && categoryName && (
              <span className={`badge ${getBadgeClass(categoryName)}`}>
                {getCategoryIcon(categoryName)}
                {categoryName}
              </span>
            )}
          </div>

          {/* Share Button */}
          <div style={{ position: "relative" }}>
            <button
              onClick={handleShare}
              className="btn btn-secondary"
              style={{
                padding: "0.75rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9rem",
                minHeight: "auto",
              }}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <h1>{title}</h1>
        <div className="meta-info">
          <span className="meta-item">
            <User size={18} />
            {authorName}
          </span>
          <span className="meta-item">
            <Calendar size={18} />
            {publishedAt &&
              format(new Date(publishedAt), "d. MMMM yyyy.", { locale: bs })}
          </span>
          <span className="meta-item">
            <Eye size={18} />
            {viewCount} pregleda
          </span>
        </div>
      </div>

      {/* Featured Images Gallery */}
      {images.length > 0 && (
        <div className="article-images">
          {images.map((image) => {
            const imageId = image.id || image.Id;
            const imageUrl = image.url || image.Url || image.FilePath;
            const fileName = image.fileName || image.FileName || "Slika";

            return (
              <div
                key={imageId || Math.random()}
                className="article-image-container"
              >
                {!imageError[imageId] ? (
                  <img
                    src={imageUrl}
                    alt={fileName}
                    className="article-image"
                    onError={() => imageId && handleImageError(imageId)}
                    loading="lazy"
                  />
                ) : (
                  <div className="image-error">
                    <ImageIcon size={48} />
                    <p>Slika nije dostupna</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Article Content - Render as HTML */}
      {content && (
        <div
          className="article-body article-content-html"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      <div className="article-footer">
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={18} />
          Povratak na početnu
        </Link>
      </div>
    </div>
  );
};

export default ArticleDetail;
