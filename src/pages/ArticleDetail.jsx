import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { articlesApi } from '../services/api';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
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
  Check
} from 'lucide-react';

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
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SCROLL_TO_TOP' }));
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
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50);
    } catch (error) {
      console.error('Error loading article:', error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (imageId) => {
    setImageError(prev => ({ ...prev, [imageId]: true }));
  };

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

  const getShareUrl = () => {
    return window.location.href;
  };

  const handleShare = async () => {
    const title = getArticleProperty('title');
    const url = getShareUrl();

    // Try native share API first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Pročitajte: ${title}`,
          url: url,
        });
        return;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }

    // Fallback to custom share menu
    setShowShareMenu(!showShareMenu);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setShowShareMenu(false);
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(getArticleProperty('title'));
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    setShowShareMenu(false);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
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
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleShare}
              className="btn btn-secondary"
              style={{
                padding: '0.75rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                minHeight: 'auto',
              }}
            >
              <Share2 size={18} />
              <span className="desktop-only">Podijeli</span>
            </button>

            {/* Share Menu */}
            {showShareMenu && (
              <>
                <div 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999,
                  }}
                  onClick={() => setShowShareMenu(false)}
                />
                <div
                  className="share-menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    padding: '0.5rem',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    zIndex: 1000,
                    minWidth: '200px',
                  }}
                >
                  <button
                    onClick={shareOnFacebook}
                    className="share-option"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      borderRadius: '0.5rem',
                      transition: 'background 0.2s',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <Facebook size={20} style={{ color: '#1877f2' }} />
                    Facebook
                  </button>
                  
                  <button
                    onClick={shareOnTwitter}
                    className="share-option"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      borderRadius: '0.5rem',
                      transition: 'background 0.2s',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <Twitter size={20} style={{ color: '#1da1f2' }} />
                    Twitter
                  </button>
                  
                  <button
                    onClick={shareOnLinkedIn}
                    className="share-option"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      borderRadius: '0.5rem',
                      transition: 'background 0.2s',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <Linkedin size={20} style={{ color: '#0a66c2' }} />
                    LinkedIn
                  </button>
                  
                  <div style={{ 
                    height: '1px', 
                    background: 'var(--border)', 
                    margin: '0.5rem 0' 
                  }} />
                  
                  <button
                    onClick={copyToClipboard}
                    className="share-option"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: 'none',
                      border: 'none',
                      color: copied ? 'var(--success)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => !copied && (e.target.style.background = 'var(--bg-tertiary)')}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    {copied ? (
                      <>
                        <Check size={20} />
                        Kopirano!
                      </>
                    ) : (
                      <>
                        <Link2 size={20} />
                        Kopiraj link
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
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