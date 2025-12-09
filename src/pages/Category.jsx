import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { articlesApi, categoriesApi } from '../services/api';
import ArticleCard from '../components/ArticleCard';

const Category = () => {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCategory();
    loadArticles();
  }, [slug, page]);

  const loadCategory = async () => {
    try {
      const response = await categoriesApi.getBySlug(slug);
      setCategory(response.data.data);
    } catch (error) {
      console.error('Error loading category:', error);
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await articlesApi.getAll({ category: slug, page, pageSize: 12 });
      setArticles(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const getCategoryEmoji = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case 'vijesti': return '📰';
      case 'saobraćaj': return '🚦';
      case 'dojave': return '⚠️';
      case 'pomoć': return '🆘';
      case 'oglasi': return '📢';
      default: return '📁';
    }
  };

  return (
    <section className="articles-section">
      <div className="container">
        <div className="section-header">
          <h2>{getCategoryEmoji(category?.name)} {category?.name || 'Kategorija'}</h2>
        </div>

        {articles.length > 0 ? (
          <>
            <div className="articles-grid">
              {articles.map((article) => (
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
              📭 Nema članaka u ovoj kategoriji.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Category;
