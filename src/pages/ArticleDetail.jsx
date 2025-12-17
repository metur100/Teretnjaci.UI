import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { articlesApi } from '../services/api';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Eye, Calendar, User, AlertTriangle, HandHelping, Megaphone, Navigation, Newspaper, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const ArticleDetail = () => {
  const { slug } = useParams();
  const location = useLocation(); // Get location to detect route changes
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState({});

  // Scroll to top on component mount and when slug changes
  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Also ensure body scroll is reset
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // For WebView compatibility
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SCROLL_TO_TOP' }));
    }
  }, [slug, location.key]); // Add location.key to trigger on any route change

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await articlesApi.getBySlug(slug);
      setArticle(response.data || null);
      
      // Small delay to ensure DOM is ready, then scroll again
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50);
    } catch (error) {
      console.error('Error loading article:', error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your existing code remains exactly the same ...
  const handleImageError = (imageId) => {
    setImageError(prev => ({ ...prev, [imageId]: true }));
  };

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
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={18} />
          Povratak na početnu
        </Link>
      </div>
    );
  }

  const categoryName = getArticleProperty('categoryName');
  const categorySlug = getArticleProperty('categorySlug');
  const title = getArticleProperty('title');
  const authorName = getArticleProperty('authorName');
  const publishedAt = getArticleProperty('publishedAt');
  const viewCount = getArticleProperty('viewCount') || 0;
  const images = article.images || article.Images || [];
  const content = getArticleProperty('content');

  return (
    <div className="article-detail">
      <div className="article-header">
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
        <h1>{title}</h1>
        <div className="meta-info">
          <span className="meta-item">
            <User size={18} />
            {authorName}
          </span>
          <span className="meta-item">
            <Calendar size={18} />
            {publishedAt && format(new Date(publishedAt), 'd. MMMM yyyy.', { locale: bs })}
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
              <div key={imageId || Math.random()} className="article-image-container">
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