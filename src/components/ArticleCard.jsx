import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Eye, Calendar, Clock, AlertTriangle } from 'lucide-react';

const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  const getBadgeClass = (category) => {
    switch (category.toLowerCase()) {
      case 'dojave':
        return 'urgent';
      case 'saobraćaj':
        return 'warning';
      default:
        return '';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'dojave':
        return <AlertTriangle size={12} />;
      case 'saobraćaj':
        return <Clock size={12} />;
      default:
        return null;
    }
  };

  return (
    <div className="article-card" onClick={() => navigate(`/clanak/${article.slug}`)}>
      <img
        src={article.primaryImageUrl || '/placeholder.jpg'}
        alt={article.title}
        className="article-image"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23334155" width="400" height="200"/%3E%3Ctext fill="%23cbd5e1" font-family="sans-serif" font-size="14" text-anchor="middle" x="200" y="100"%3ETeretnjaci.ba%3C/text%3E%3C/svg%3E';
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
        <div className="meta-info" style={{ fontSize: '0.85rem' }}>
          <span className="meta-item">
            <Calendar size={14} />
            {article.publishedAt && format(new Date(article.publishedAt), 'd. MMM', { locale: bs })}
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
