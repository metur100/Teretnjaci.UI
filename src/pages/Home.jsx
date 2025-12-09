import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { articlesApi, categoriesApi } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Eye, Calendar, User, TrendingUp, Clock, Facebook, Instagram } from 'lucide-react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

const Home = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [latestArticles, setLatestArticles] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [categoryArticles, setCategoryArticles] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchQuery = searchParams.get('search');

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (searchQuery) {
        const response = await articlesApi.getAll({ search: searchQuery, pageSize: 12 });
        setLatestArticles(response.data.data);
      } else {
        // Load categories
        const catResponse = await categoriesApi.getAll();
        setCategories(catResponse.data.data);
        
        // Load latest articles (2 rows = 6 articles on desktop, 6 on mobile)
        const latestResponse = await articlesApi.getAll({ page: 1, pageSize: 6 });
        setLatestArticles(latestResponse.data.data);
        
        // Load popular articles (sorted by views)
        const popularResponse = await articlesApi.getAll({ page: 1, pageSize: 4 });
        // Sort by viewCount on frontend since API might not support it
        const sorted = [...popularResponse.data.data].sort((a, b) => b.viewCount - a.viewCount);
        setPopularArticles(sorted.slice(0, 4));
        
        // Load articles per category (3 per category)
        const categoryData = {};
        for (const cat of catResponse.data.data) {
          const response = await articlesApi.getAll({ categoryId: cat.id, pageSize: 3 });
          categoryData[cat.slug] = response.data.data;
        }
        setCategoryArticles(categoryData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
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
        return <TrendingUp size={14} />;
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

  const featuredArticle = latestArticles[0];

  return (
    <>
      {!searchQuery && featuredArticle && (
        <section className="hero-section">
          <div className="container">
            <div 
              className="featured-card"
              onClick={() => navigate(`/clanak/${featuredArticle.slug}`)}
            >
              <img
                src={featuredArticle.primaryImageUrl || '/placeholder.jpg'}
                alt={featuredArticle.title}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23334155" width="800" height="400"/%3E%3Ctext fill="%23cbd5e1" font-family="sans-serif" font-size="20" text-anchor="middle" x="400" y="200"%3ETeretnjaci.ba%3C/text%3E%3C/svg%3E';
                }}
              />
              <div className="featured-overlay">
                <span className={`badge ${getBadgeClass(featuredArticle.categoryName)}`}>
                  {getCategoryIcon(featuredArticle.categoryName)}
                  {featuredArticle.categoryName}
                </span>
                <h2>{featuredArticle.title}</h2>
                <div className="meta-info">
                  <span className="meta-item">
                    <User size={16} />
                    {featuredArticle.authorName}
                  </span>
                  <span className="meta-item">
                    <Calendar size={16} />
                    {featuredArticle.publishedAt && format(new Date(featuredArticle.publishedAt), 'd. MMM yyyy', { locale: hr })}
                  </span>
                  <span className="meta-item">
                    <Eye size={16} />
                    {featuredArticle.viewCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles - 2 rows only */}
      <section className="articles-section">
        <div className="container">
          <div className="section-header">
            <h2>{searchQuery ? `Rezultati: "${searchQuery}"` : '📰 Najnovije objave'}</h2>
          </div>

          {latestArticles.length > 0 ? (
            <div className="articles-grid">
              {(searchQuery ? latestArticles : latestArticles.slice(1, 7)).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                {searchQuery ? '🔍 Nema rezultata pretrage.' : '📭 Trenutno nema članaka za prikaz.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Articles Section */}
      {!searchQuery && popularArticles.length > 0 && (
        <section className="articles-section" style={{ background: 'var(--bg-secondary)', padding: '3rem 0' }}>
          <div className="container">
            <div className="section-header">
              <h2>🔥 Popularno</h2>
            </div>
            <div className="articles-grid">
              {popularArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Sections */}
      {!searchQuery && categories.map((category) => {
        const articles = categoryArticles[category.slug] || [];
        if (articles.length === 0) return null;
        
        return (
          <section key={category.id} className="articles-section">
            <div className="container">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{category.name}</h2>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/kategorija/${category.slug}`)}
                  style={{ fontSize: '0.875rem' }}
                >
                  Vidi sve →
                </button>
              </div>
              <div className="articles-grid">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Social Media & Sponsor Section */}
      {!searchQuery && (
        <section className="footer-section" style={{ background: 'var(--bg-secondary)', padding: '3rem 0', marginTop: '3rem' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
              
              {/* Social Media */}
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Pratite nas</h3>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href="https://facebook.com/teretnjaci.ba"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '1rem 2rem',
                      background: '#1877f2',
                      color: 'white',
                      borderRadius: '0.75rem',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)'
                    }}
                  >
                    <Facebook size={24} />
                    Facebook
                  </a>
                  <a
                    href="https://instagram.com/teretnjaci.ba"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '1rem 2rem',
                      background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                      color: 'white',
                      borderRadius: '0.75rem',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 12px rgba(188, 24, 136, 0.3)'
                    }}
                  >
                    <Instagram size={24} />
                    Instagram
                  </a>
                </div>
              </div>

              {/* Sponsor Section */}
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Sponzor stranice</h3>
                <div style={{
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  maxWidth: '400px',
                  margin: '0 auto',
                  transition: 'all 0.3s'
                }}>
                  <img
                    src="https://via.placeholder.com/300x150?text=Your+Company+Logo"
                    alt="Sponzor"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem'
                    }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="150"%3E%3Crect fill="%23334155" width="300" height="150"/%3E%3Ctext fill="%23cbd5e1" font-family="sans-serif" font-size="16" text-anchor="middle" x="150" y="75"%3ESponzor Logo%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Vaša kompanija ovdje? Kontaktirajte nas za oglašavanje.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;