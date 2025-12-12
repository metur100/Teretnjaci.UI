import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { bs } from "date-fns/locale";
import { Eye, Calendar, Clock, AlertTriangle } from "lucide-react";
import teretnjaci from "../images/teretnjaci.png";

const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  const getBadgeClass = (category) => {
    switch (category.toLowerCase()) {
      case "dojave":
        return "urgent";
      case "saobraćaj":
        return "warning";
      default:
        return "";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "dojave":
        return <AlertTriangle size={12} />;
      case "saobraćaj":
        return <Clock size={12} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="article-card"
      onClick={() => navigate(`/clanak/${article.slug}`)}
    >
      <img
        src={article.primaryImageUrl || "/placeholder.jpg"}
        alt={article.title}
        className="article-image"
        onError={(e) => {
          e.target.src = teretnjaci;
          e.target.style.objectFit = "contain";
          e.target.style.padding = "1rem";
          e.target.style.background = "var(--bg-secondary)";
        }}
      />
      <div className="article-content">
        <span className={`badge ${getBadgeClass(article.categoryName)}`}>
          {getCategoryIcon(article.categoryName)}
          {article.categoryName}
        </span>
        <h3>{article.title}</h3>
        {article.summary && (
          <p className="article-summary">{article.summary}</p>
        )}
        <div className="meta-info" style={{ fontSize: "0.85rem" }}>
          <span className="meta-item">
            <Calendar size={14} />
            {article.publishedAt &&
              format(new Date(article.publishedAt), "d. MMM", { locale: bs })}
          </span>
          <span className="meta-item">
            <Eye size={14} />
            {article.viewCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
