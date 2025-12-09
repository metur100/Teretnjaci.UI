import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articlesApi } from '../services/api';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Eye, Calendar, User, AlertTriangle, Clock, ArrowLeft } from 'lucide-react';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await articlesApi.getBySlug(slug);
      setArticle(response.data.data);
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

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
        return <AlertTriangle size={14} />;
      case 'saobraćaj':
        return <Clock size={14} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>❌ Članak nije pronađen</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Članak koji tražite možda je premješten ili obrisan.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={18} />
          Povratak na početnu
        </Link>
      </div>
    );
  }

  return (
    <div className="article-detail">
      <div className="article-header">
        <Link to={`/kategorija/${article.categorySlug}`}>
          <span className={`badge ${getBadgeClass(article.categoryName)}`}>
            {getCategoryIcon(article.categoryName)}
            {article.categoryName}
          </span>
        </Link>
        <h1>{article.title}</h1>
        <div className="meta-info">
          <span className="meta-item">
            <User size={18} />
            {article.authorName}
          </span>
          <span className="meta-item">
            <Calendar size={18} />
            {article.publishedAt && format(new Date(article.publishedAt), 'd. MMMM yyyy.', { locale: hr })}
          </span>
          <span className="meta-item">
            <Eye size={18} />
            {article.viewCount} pregleda
          </span>
        </div>
      </div>

      {article.images && article.images.length > 0 && (
        <div className="article-images">
          {article.images.map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt={image.fileName}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ))}
        </div>
      )}

      <div className="article-body">
        {article.content.split('\n').map((paragraph, index) => (
          paragraph.trim() && <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={18} />
          Povratak na početnu
        </Link>
      </div>
    </div>
  );
};

export default ArticleDetail;