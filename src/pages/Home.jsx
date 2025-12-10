import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { articlesApi, categoriesApi } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Eye, Calendar, User, TrendingUp, Clock, Facebook, Instagram, Sparkles, Flame, Zap } from 'lucide-react';
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
  const [featuredHovered, setFeaturedHovered] = useState(false);

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
        
        // Load latest articles
        const latestResponse = await articlesApi.getAll({ page: 1, pageSize: 6 });
        setLatestArticles(latestResponse.data.data);
        
        // Load popular articles
        const popularResponse = await articlesApi.getAll({ page: 1, pageSize: 4 });
        const sorted = [...popularResponse.data.data].sort((a, b) => b.viewCount - a.viewCount);
        setPopularArticles(sorted.slice(0, 4));
        
        // Load articles per category
        const categoryData = {};
        for (const cat of catResponse.data.data) {
        const response = await articlesApi.getAll({ category: cat.slug, pageSize: 3 });
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
        return 'urgent pulse-animation';
      case 'saobraćaj':
        return 'warning glow-animation';
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
        <section className="hero-section fade-in-up">
          <div className="container">
            <div 
              className="featured-card gradient-border hover-lift"
              onClick={() => navigate(`/clanak/${featuredArticle.slug}`)}
              onMouseEnter={() => setFeaturedHovered(true)}
              onMouseLeave={() => setFeaturedHovered(false)}
              style={{
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                height: '400px'
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
                <img
                  src={featuredArticle.primaryImageUrl || '/placeholder.jpg'}
                  alt={featuredArticle.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                    transform: featuredHovered ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" stop-color="%231a202c"/%3E%3Cstop offset="100%" stop-color="%232d3748"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="400" fill="url(%23grad)"/%3E%3Ctext fill="%23cbd5e1" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" x="400" y="200"%3ETeretnjaci.ba%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)',
                  opacity: featuredHovered ? 0.9 : 0.7,
                  transition: 'opacity 0.3s'
                }} />
              </div>
              <div className="featured-overlay">
                <span className={`badge ${getBadgeClass(featuredArticle.categoryName)}`}>
                  {getCategoryIcon(featuredArticle.categoryName)}
                  {featuredArticle.categoryName}
                </span>
                <h2 style={{
                  margin: '1rem 0',
                  fontSize: '2rem',
                  lineHeight: 1.2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  transition: 'transform 0.3s',
                  transform: featuredHovered ? 'translateY(-5px)' : 'translateY(0)'
                }}>
                  {featuredArticle.title}
                </h2>
                <div className="meta-info" style={{
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'center',
                  opacity: featuredHovered ? 1 : 0.9,
                  transition: 'opacity 0.3s'
                }}>
                  <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} />
                    {featuredArticle.authorName}
                  </span>
                  <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} />
                    {featuredArticle.publishedAt && format(new Date(featuredArticle.publishedAt), 'd. MMM yyyy', { locale: hr })}
                  </span>
                  <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Eye size={16} />
                    {featuredArticle.viewCount}
                  </span>
                  {featuredHovered && (
                    <span style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(255,255,255,0.2)',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      backdropFilter: 'blur(10px)',
                      fontSize: '0.9rem',
                      animation: 'fadeInUp 0.3s ease-out'
                    }}>
                      Pročitaj više
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section className="articles-section fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              {searchQuery ? (
                <>
                  <Sparkles size={24} style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }} />
                  Rezultati: "{searchQuery}"
                </>
              ) : (
                <>
                  <Zap size={24} style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }} />
                  Najnovije objave
                </>
              )}
            </h2>
          </div>

          {latestArticles.length > 0 ? (
            <div className="articles-grid">
              {(searchQuery ? latestArticles : latestArticles.slice(1, 7)).map((article, index) => (
                <div 
                  key={article.id} 
                  className="hover-lift"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          ) : (
            <div className="fade-in-up" style={{ 
              textAlign: 'center', 
              padding: '4rem 1rem',
              background: 'var(--bg-secondary)',
              borderRadius: '1rem',
              border: '2px dashed var(--border)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {searchQuery ? '🔍' : '📭'}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                {searchQuery ? 'Nema rezultata pretrage.' : 'Trenutno nema članaka za prikaz.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Articles Section */}
      {!searchQuery && popularArticles.length > 0 && (
        <section className="articles-section fade-in-up" style={{ 
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(74, 85, 104, 0.1) 100%)',
          padding: '4rem 0',
          margin: '3rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(78, 205, 196, 0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="section-header">
              <h2 className="section-title">
                <Flame size={24} style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle', color: '#ff6b6b' }} />
                Popularno
              </h2>
            </div>
            <div className="articles-grid">
              {popularArticles.map((article, index) => (
                <div 
                  key={article.id} 
                  className="hover-lift"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Sections */}
      {!searchQuery && categories.map((category, categoryIndex) => {
        const articles = categoryArticles[category.slug] || [];
        if (articles.length === 0) return null;
        
        return (
          <section 
            key={category.id} 
            className="articles-section fade-in-up" 
            style={{ animationDelay: `${categoryIndex * 0.1}s` }}
          >
            <div className="container">
              <div className="section-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <h2 className="section-title" style={{ margin: 0 }}>
                  {category.name}
                </h2>
                <button
                  className="btn btn-secondary hover-grow"
                  onClick={() => navigate(`/kategorija/${category.slug}`)}
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '50px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 600,
                    transition: 'all 0.3s'
                  }}
                >
                  Vidi sve →
                </button>
              </div>
              <div className="articles-grid">
                {articles.map((article, index) => (
                  <div 
                    key={article.id} 
                    className="hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Social Media & Sponsor Section */}
      {!searchQuery && (
        <section className="footer-section fade-in-up" style={{ 
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          padding: '4rem 0',
          marginTop: '4rem',
          borderTop: '1px solid var(--border)'
        }}>
          <div className="container">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '4rem',
              alignItems: 'center'
            }}>
              
              {/* Social Media */}
              <div style={{ textAlign: 'center' }}>
                <h3 className="section-title" style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>
                  Pratite nas
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  Budite u toku sa najnovijim dešavanjima u svijetu teretnog transporta
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href="https://facebook.com/teretnjaci.ba"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link hover-grow"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem 2rem',
                      background: 'linear-gradient(135deg, #1877f2 0%, #166fe5 100%)',
                      color: 'white',
                      borderRadius: '0.75rem',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 15px rgba(24, 119, 242, 0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Facebook size={24} />
                    Facebook
                  </a>
                  <a
                    href="https://instagram.com/teretnjaci.ba"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link hover-grow"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem 2rem',
                      background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                      color: 'white',
                      borderRadius: '0.75rem',
                      textDecoration: 'none',
                      fontWeight: 600,
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 15px rgba(188, 24, 136, 0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Instagram size={24} />
                    Instagram
                  </a>
                </div>
              </div>

              {/* Sponsor Section */}
              <div style={{ textAlign: 'center' }}>
                <h3 className="section-title" style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>
                  Sponzor stranice
                </h3>
                <div className="gradient-border hover-lift" style={{
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  maxWidth: '400px',
                  margin: '0 auto',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div className="hover-grow" style={{ 
                    position: 'relative', 
                    overflow: 'hidden', 
                    borderRadius: '0.5rem', 
                    marginBottom: '1rem' 
                  }}>
                    <img
                      src="./images/sponzor.jpg"
                      alt="Sponzor"
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '0.5rem',
                        transition: 'transform 0.5s ease'
                      }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="150"%3E%3Cdefs%3E%3ClinearGradient id="sponsorGrad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" stop-color="%234a5568"/%3E%3Cstop offset="100%" stop-color="%232d3748"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="300" height="150" fill="url(%23sponsorGrad)"/%3E%3Ctext fill="%23cbd5e1" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" x="150" y="75"%3ESponzor Teretnjaci.ba%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                    height: '1px',
                    margin: '1rem 0'
                  }} />
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.875rem',
                    lineHeight: 1.6
                  }}>
                    Želite da vaša kompanija bude ovdje?<br />
                    <a 
                      href="mailto:kontakt@teretnjaci.ba" 
                      style={{
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        transition: 'color 0.3s'
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--primary)'}
                    >
                      Kontaktirajte nas
                    </a> za oglašavanje i saradnju.
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