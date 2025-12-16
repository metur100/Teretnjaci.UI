import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { bs } from "date-fns/locale";
import { Eye, Calendar, HandHelping, AlertTriangle, Navigation, Newspaper, Megaphone } from "lucide-react";
import teretnjaci from "../images/teretnjaci.png";

const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  // Safe helper function to get article property
  const getArticleProperty = (prop) => {
    if (!article) return "";
    return article[prop] || 
           article[prop.charAt(0).toUpperCase() + prop.slice(1)] || 
           article[prop.toLowerCase()] || "";
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

  const articleSlug = getArticleProperty('slug');
  const categoryName = getArticleProperty('categoryName');
  const title = getArticleProperty('title');
  const primaryImageUrl = getArticleProperty('primaryImageUrl');
  const summary = getArticleProperty('summary');
  const publishedAt = getArticleProperty('publishedAt');
  const viewCount = getArticleProperty('viewCount') || 0;

  return (
    <div
      className="article-card"
      onClick={() => articleSlug && navigate(`/clanak/${articleSlug}`)}
      style={{ cursor: articleSlug ? 'pointer' : 'default' }}
    >
      <img
        src={primaryImageUrl || "/placeholder.jpg"}
        alt={title}
        className="article-image"
        onError={(e) => {
          e.target.src = teretnjaci;
          e.target.style.objectFit = "contain";
          e.target.style.padding = "1rem";
          e.target.style.background = "var(--bg-secondary)";
        }}
      />
      <div className="article-content">
        <span className={`badge ${getBadgeClass(categoryName)}`}>
          {getCategoryIcon(categoryName)}
          {categoryName}
        </span>
        <h3>{title}</h3>
        {summary && (
          <p className="article-summary">{summary}</p>
        )}
        <div className="meta-info" style={{ fontSize: "0.85rem" }}>
          <span className="meta-item">
            <Calendar size={14} />
            {publishedAt &&
              format(new Date(publishedAt), "d. MMM", { locale: bs })}
          </span>
          <span className="meta-item">
            <Eye size={14} />
            {viewCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;