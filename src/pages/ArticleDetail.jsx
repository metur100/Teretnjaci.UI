import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
  MessageCircle,
  Copy,
  Check,
  X
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
    return `https://teretnjaci.ba/clanak/${slug}`;
  };

  const handleShare = async () => {
    const title = getArticleProperty('title');
    const text = `Pročitajte: ${title}`;
    const url = getShareUrl();

    // Try native share API first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        return;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }

    // For Android/Web: Fallback to Web Share API with text/URL
    if (navigator.canShare && navigator.canShare({ text: `${text} ${url}` })) {
      try {
        await navigator.share({
          text: `${text} ${url}`,
        });
        return;
      } catch (error) {
        console.error('Error sharing with text only:', error);
      }
    }

    // Fallback to custom share menu
    setShowShareMenu(true);
  };

  const copyToClipboard = async () => {
    try {
      const shareUrl = getShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = getShareUrl();
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setShowShareMenu(false);
        }, 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const shareViaMessenger = () => {
    const shareUrl = getShareUrl();
    const text = encodeURIComponent(`Pročitajte ovaj članak: ${getArticleProperty('title')}\n\n${shareUrl}`);
    window.open(`fb-messenger://share?link=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareViaWhatsApp = () => {
    const shareUrl = getShareUrl();
    const text = encodeURIComponent(`Pročitajte ovaj članak: ${getArticleProperty('title')}\n\n${shareUrl}`);
    window.open(`whatsapp://send?text=${text}`, '_blank');
  };

  const shareViaSMS = () => {
    const shareUrl = getShareUrl();
    const text = encodeURIComponent(`Pročitajte ovaj članak: ${getArticleProperty('title')}\n\n${shareUrl}`);
    window.open(`sms:?body=${text}`, '_blank');
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
          <meta property="og:image" content="https://i.ibb.co/wFNwCtMZ/441a68a4f946.png" />
          <meta name="description" content="Teretnjaci.ba - Vijesti, saobraćaj i pomoć" />
        </Helmet>
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
      </>
    );
  }

  // Get article data
  const categoryName = getArticleProperty('categoryName');
  const categorySlug = getArticleProperty('categorySlug');
  const title = getArticleProperty('title');
  const authorName = getArticleProperty('authorName');
  const publishedAt = getArticleProperty('publishedAt');
  const viewCount = getArticleProperty('viewCount') || 0;
  const images = article.images || article.Images || [];
  const content = getArticleProperty('content');

  const primaryImage = images.find(img => img.IsPrimary || img.isPrimary);
  const firstImage = images[0];
  const ogImage = primaryImage?.FilePath || primaryImage?.Url || 
                 firstImage?.FilePath || firstImage?.Url || 
                 'https://i.ibb.co/wFNwCtMZ/441a68a4f946.png';

  return (
    <div className="article-detail">
      {/* Dynamic Meta Tags for Social Sharing */}
      <Helmet>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:image" content={ogImage} />
        <meta name="description" content="Teretnjaci.ba - Vijesti, saobraćaj i pomoć" />
      </Helmet>

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
                  className="share-overlay"
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999,
                    background: 'rgba(0, 0, 0, 0.5)',
                    animation: 'fadeIn 0.2s ease',
                  }}
                  onClick={() => setShowShareMenu(false)}
                />
                <div
                  className="share-menu"
                  style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    zIndex: 1000,
                    minWidth: '280px',
                    maxWidth: '90vw',
                    animation: 'slideUp 0.3s ease',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                      Podijeli članak
                    </h3>
                    <button
                      onClick={() => setShowShareMenu(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    {/* WhatsApp */}
                    <button
                      onClick={shareViaWhatsApp}
                      className="share-app-btn"
                      style={{
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        borderRadius: '0.75rem',
                        transition: 'all 0.2s',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(37, 211, 102, 0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold'
                      }}>
                        WA
                      </div>
                      WhatsApp
                    </button>
                    
                    {/* Messenger */}
                    <button
                      onClick={shareViaMessenger}
                      className="share-app-btn"
                      style={{
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        borderRadius: '0.75rem',
                        transition: 'all 0.2s',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(0, 132, 255, 0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#0084FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px'
                      }}>
                        <MessageCircle size={24} />
                      </div>
                      Messenger
                    </button>
                    
                    {/* SMS */}
                    <button
                      onClick={shareViaSMS}
                      className="share-app-btn"
                      style={{
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        borderRadius: '0.75rem',
                        transition: 'all 0.2s',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(121, 121, 121, 0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#797979',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px'
                      }}>
                        SMS
                      </div>
                      Poruka
                    </button>
                    
                    {/* Copy Link */}
                    <button
                      onClick={copyToClipboard}
                      className="share-app-btn"
                      style={{
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: copied ? 'rgba(46, 204, 113, 0.1)' : 'none',
                        border: copied ? '1px solid var(--success)' : '1px solid var(--border)',
                        color: copied ? 'var(--success)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        borderRadius: '0.75rem',
                        transition: 'all 0.2s',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => !copied && (e.target.style.background = 'rgba(0, 119, 255, 0.1)')}
                      onMouseLeave={(e) => !copied && (e.target.style.background = 'none')}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: copied ? 'var(--success)' : 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px'
                      }}>
                        {copied ? <Check size={24} /> : <Copy size={24} />}
                      </div>
                      {copied ? 'Kopirano!' : 'Kopiraj link'}
                    </button>
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-secondary)', 
                    textAlign: 'center',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '1rem'
                  }}>
                    Link će biti kopiran i možete ga podijeliti u bilo kojoj aplikaciji
                  </div>
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

      {/* Add some CSS animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translate(-50%, -40%);
            }
            to { 
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
          
          .share-app-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .share-app-btn:active {
            transform: translateY(0);
          }
        `}
      </style>
    </div>
  );
};

export default ArticleDetail;