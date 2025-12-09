import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { articlesApi } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Eye, Calendar, User, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

const Home = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchQuery = searchParams.get('search');

  useEffect(() => {
    loadArticles();
  }, [page, searchQuery]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const params = { page, pageSize: 12 };
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await articlesApi.getAll(params);
      setArticles(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error loading articles:', error);
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

  if (loading && page === 1) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const featuredArticle = articles[0];
  const gridArticles = articles.slice(1);

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

      <section className="articles-section">
        <div className="container">
          <div className="section-header">
            <h2>{searchQuery ? `Rezultati: "${searchQuery}"` : '📰 Najnovije objave'}</h2>
          </div>

          {gridArticles.length > 0 ? (
            <>
              <div className="articles-grid">
                {gridArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    ← Prethodna
                  </button>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Stranica {page} / {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Sljedeća →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                {searchQuery ? '🔍 Nema rezultata pretrage.' : '📭 Trenutno nema članaka za prikaz.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;