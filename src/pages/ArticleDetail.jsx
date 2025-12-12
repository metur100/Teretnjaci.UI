// ArticleDetail.jsx - Full updated version
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articlesApi } from '../services/api';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Eye, Calendar, User, AlertTriangle, HandHelping, Megaphone, Navigation, Newspaper, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState({});

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

  const handleImageError = (imageId) => {
    setImageError(prev => ({ ...prev, [imageId]: true }));
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
        return <AlertTriangle size={12} />;
      case "saobraćaj":
        return <Navigation size={12} />;
      case "vijesti":
        return <Newspaper size={12} />;
      case "oglasi":
        return <Megaphone size={12} />;
     case "pomoć":
        return <HandHelping size={12} />;
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
            {article.publishedAt && format(new Date(article.publishedAt), 'd. MMMM yyyy.', { locale: bs })}
          </span>
          <span className="meta-item">
            <Eye size={18} />
            {article.viewCount} pregleda
          </span>
        </div>
      </div>

      {/* Featured Images Gallery */}
      {article.images && article.images.length > 0 && (
        <div className="article-images">
          {article.images.map((image) => (
            <div key={image.id} className="article-image-container">
              {!imageError[image.id] ? (
                <img
                  src={image.url}
                  alt={image.fileName}
                  className="article-image"
                  onError={() => handleImageError(image.id)}
                  loading="lazy"
                />
              ) : (
                <div className="image-error">
                  <ImageIcon size={48} />
                  <p>Slika nije dostupna</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Article Content - Render as HTML */}
      <div 
        className="article-body article-content-html"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

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