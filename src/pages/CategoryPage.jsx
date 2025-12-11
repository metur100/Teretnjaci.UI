// CategoryPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { articlesApi, categoriesApi } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { AlertTriangle, Heart, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 12;

  useEffect(() => {
    loadCategoryData();
  }, [slug, currentPage]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      
      const categoriesResponse = await categoriesApi.getAll();
      const categoriesData = categoriesResponse.data.data || categoriesResponse.data;
      const foundCategory = categoriesData.find(cat => cat.slug === slug);
      setCategory(foundCategory);
      
      const response = await articlesApi.getAll({ 
        category: slug, 
        page: currentPage,
        pageSize: pageSize 
      });
      
      const responseData = response.data.data || response.data;
      const paginationData = response.data.pagination || {};
      
      setArticles(Array.isArray(responseData) ? responseData : []);
      setTotalPages(paginationData.totalPages || Math.ceil((paginationData.totalItems || responseData.length) / pageSize) || 1);
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getCategoryIcon = () => {
    if (!category) return null;
    
    switch (category.slug.toLowerCase()) {
      case 'saobracaj':
        return <AlertTriangle size={32} style={{ color: '#ff6b6b' }} />;
      case 'pomoc':
        return <Heart size={32} style={{ color: '#ff6b6b' }} />;
      case 'dojave':
        return <TrendingUp size={32} style={{ color: '#ff6b6b' }} />;
      default:
        return null;
    }
  };

  const getCategoryDescription = () => {
    if (!category) return '';
    
    switch (category.slug.toLowerCase()) {
      case 'saobracaj':
        return 'Informacije o saobraćajnoj situaciji, zatvaranjima puteva i važnim dojavama za vozače.';
      case 'pomoc':
        return 'Potrebna pomoć ili želite pomoći? Ovdje možete pronaći sve relevantne informacije.';
      case 'dojave':
        return 'Najnovije dojave i važne informacije iz svijeta teretnog transporta.';
      case 'vijesti':
        return 'Sve vijesti i aktuelnosti iz svijeta transporta i logistike.';
      default:
        return `Svi članci iz kategorije ${category.name}`;
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Učitavanje članaka...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1>Kategorija nije pronađena</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Tražena kategorija ne postoji ili je uklonjena.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <section style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(74, 85, 104, 0.1) 100%)',
        padding: '4rem 0',
        marginBottom: '3rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem',
            marginBottom: '1rem'
          }}>
            {getCategoryIcon()}
            <h1 style={{ 
              fontSize: '2.5rem', 
              margin: 0,
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {category.name}
            </h1>
          </div>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.1rem',
            maxWidth: '700px',
            lineHeight: 1.6
          }}>
            {getCategoryDescription()}
          </p>
          <div style={{ 
            marginTop: '1.5rem',
            padding: '0.75rem 1.25rem',
            background: 'var(--bg-card)',
            borderRadius: '0.5rem',
            display: 'inline-block',
            border: '1px solid var(--border)'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Ukupno članaka: <strong style={{ color: 'var(--text-primary)' }}>{articles.length > 0 ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, (currentPage - 1) * pageSize + articles.length)}` : '0'}</strong>
            </span>
          </div>
        </div>
      </section>

      <section className="articles-section">
        <div className="container">
          {articles.length > 0 ? (
            <>
              <div className="articles-grid">
                {articles.map((article, index) => (
                  <div 
                    key={article.id}
                    className="hover-lift"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>

// CategoryPage.jsx - Updated Pagination Section
{totalPages > 1 && (
  <div className="pagination-wrapper">
    <div className="pagination-container">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`pagination-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}`}
      >
        <ChevronLeft size={18} />
        <span className="btn-text">Prethodna</span>
      </button>

      <div className="page-numbers">
        {[...Array(totalPages)].map((_, index) => {
          const pageNum = index + 1;
          
          // Show first page, last page, current page, and pages around current page
          const showPage = 
            totalPages <= 7 || 
            pageNum === 1 || 
            pageNum === totalPages || 
            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
          
          const showEllipsis = 
            totalPages > 7 && (
              (pageNum === 2 && currentPage > 3) ||
              (pageNum === totalPages - 1 && currentPage < totalPages - 2)
            );
          
          if (!showPage && !showEllipsis) return null;
          
          if (showEllipsis) {
            return (
              <span 
                key={`ellipsis-${pageNum}`}
                className="page-ellipsis"
              >
                ...
              </span>
            );
          }
          
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`page-btn ${pageNum === currentPage ? 'active' : ''}`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`pagination-btn next-btn ${currentPage === totalPages ? 'disabled' : ''}`}
      >
        <span className="btn-text">Sljedeća</span>
        <ChevronRight size={18} />
      </button>
    </div>

  </div>
)}
            </>
          ) : (
            <div className="fade-in-up" style={{ 
              textAlign: 'center', 
              padding: '6rem 2rem',
              background: 'var(--bg-secondary)',
              borderRadius: '1.5rem',
              border: '2px dashed var(--border)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
                📭
              </div>
              <h2 style={{ marginBottom: '1rem' }}>Nema članaka u ovoj kategoriji</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Trenutno nema objavljenih članaka u kategoriji "{category.name}".
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CategoryPage;