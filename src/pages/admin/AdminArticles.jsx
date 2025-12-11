import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { articlesApi } from "../../services/api";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  User,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { hr } from "date-fns/locale";

// Custom Confirmation Dialog Component
const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Otkaži
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Potvrdi
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadArticles();
  }, [page, filter]);

  const loadArticles = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        pageSize: 15, // Reduced for better mobile view
      };

      if (filter === "published") {
        params.isPublished = true;
      } else if (filter === "draft") {
        params.isPublished = false;
      }

      const response = await articlesApi.getAllAdmin(params);
      setArticles(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id, title) => {
    setArticleToDelete({ id, title });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      await articlesApi.delete(articleToDelete.id);
      loadArticles();
    } catch (error) {
      alert("Greška pri brisanju članka");
    } finally {
      setShowDeleteDialog(false);
      setArticleToDelete(null);
    }
  };

  const formatDate = (article) => {
    if (article.publishedAt) {
      return format(new Date(article.publishedAt), "d. MMM", { locale: hr });
    }
    return format(new Date(article.createdAt), "d. MMM", { locale: hr });
  };

  const getStatusColor = (isPublished) => {
    return isPublished ? "#22c55e" : "#f59e0b";
  };

  const getStatusText = (isPublished) => {
    return isPublished ? "Objavljeno" : "Draft";
  };

  const getStatusIcon = (isPublished) => {
    return isPublished ? "●" : "◌";
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Brisanje članka"
        message={`Jeste li sigurni da želite obrisati članak "${articleToDelete?.title}"?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setArticleToDelete(null);
        }}
      />

      <div>
        <div className="admin-header">
          <h1>Upravljanje člancima</h1>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/clanci/novi")}
            style={{
              padding: "0.875rem 2rem",
              fontWeight: "700",
              letterSpacing: "0.3px",
            }}
          >
            <Plus size={18} />
            <span className="desktop-only">Novi članak</span>
            <span className="mobile-only">Novi</span>
          </button>
        </div>

        {/* Filter Tabs - Desktop */}
        <div
          className="filter-tabs desktop-only"
          style={{ marginBottom: "2rem" }}
        >
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Svi članci
          </button>
          <button
            className={`filter-tab ${filter === "published" ? "active" : ""}`}
            onClick={() => setFilter("published")}
          >
            Objavljeni
          </button>
          <button
            className={`filter-tab ${filter === "draft" ? "active" : ""}`}
            onClick={() => setFilter("draft")}
          >
            Draftovi
          </button>
        </div>

        {/* Mobile Filter Dropdown */}
        {showMobileFilters && (
          <div
            className="mobile-only"
            style={{
              marginBottom: "1rem",
              background: "var(--bg-card)",
              borderRadius: "0.75rem",
              border: "1px solid var(--border)",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <button
                className={`filter-tab-mobile ${
                  filter === "all" ? "active" : ""
                }`}
                onClick={() => {
                  setFilter("all");
                  setShowMobileFilters(false);
                }}
                style={{
                  padding: "0.75rem",
                  background:
                    filter === "all" ? "var(--primary)" : "var(--bg-tertiary)",
                  color: filter === "all" ? "white" : "var(--text-primary)",
                  border: "none",
                  borderRadius: "0.5rem",
                  textAlign: "left",
                }}
              >
                Svi članci
              </button>
              <button
                className={`filter-tab-mobile ${
                  filter === "published" ? "active" : ""
                }`}
                onClick={() => {
                  setFilter("published");
                  setShowMobileFilters(false);
                }}
                style={{
                  padding: "0.75rem",
                  background:
                    filter === "published"
                      ? "var(--primary)"
                      : "var(--bg-tertiary)",
                  color:
                    filter === "published" ? "white" : "var(--text-primary)",
                  border: "none",
                  borderRadius: "0.5rem",
                  textAlign: "left",
                }}
              >
                Objavljeni
              </button>
              <button
                className={`filter-tab-mobile ${
                  filter === "draft" ? "active" : ""
                }`}
                onClick={() => {
                  setFilter("draft");
                  setShowMobileFilters(false);
                }}
                style={{
                  padding: "0.75rem",
                  background:
                    filter === "draft"
                      ? "var(--primary)"
                      : "var(--bg-tertiary)",
                  color: filter === "draft" ? "white" : "var(--text-primary)",
                  border: "none",
                  borderRadius: "0.5rem",
                  textAlign: "left",
                }}
              >
                Draftovi
              </button>
            </div>
          </div>
        )}

        {articles.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="table-container desktop-only">
              <table className="table">
                <thead>
                  <tr>
                    <th>Naslov</th>
                    <th>Status</th>
                    <th>Datum</th>
                    <th style={{ width: "150px" }}>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className={!article.isPublished ? "draft-row" : ""}
                    >
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: getStatusColor(
                                article.isPublished
                              ),
                              marginTop: "0.5rem",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong
                              style={{
                                display: "block",
                                marginBottom: "0.25rem",
                              }}
                            >
                              {article.title}
                            </strong>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {article.categoryName}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  color: "var(--text-secondary)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                }}
                              >
                                <User size={12} />
                                {article.authorName}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  color: "var(--text-secondary)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                }}
                              >
                                <Eye size={12} />
                                {article.viewCount}
                              </span>
                            </div>
                            {article.summary && (
                              <p
                                style={{
                                  fontSize: "0.875rem",
                                  color: "var(--text-secondary)",
                                  marginTop: "0.5rem",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {article.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: `${getStatusColor(
                              article.isPublished
                            )}20`,
                            color: getStatusColor(article.isPublished),
                          }}
                        >
                          {getStatusText(article.isPublished)}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <Calendar size={14} />
                          {formatDate(article)}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() =>
                              navigate(`/admin/clanci/uredi/${article.id}`)
                            }
                            title="Uredi"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleDeleteClick(article.id, article.title)
                            }
                            title="Obriši"
                          >
                            <Trash2 size={16} />
                          </button>
                          {article.isPublished && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() =>
                                window.open(`/clanak/${article.slug}`, "_blank")
                              }
                              title="Pogledaj članak"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="mobile-card-list">
              {articles.map((article) => (
                <div key={article.id} className="mobile-card">
                  <div className="mobile-card-header">
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: getStatusColor(
                              article.isPublished
                            ),
                            flexShrink: 0,
                          }}
                        />
                        <span
                          className="status-badge"
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.5rem",
                            backgroundColor: `${getStatusColor(
                              article.isPublished
                            )}20`,
                            color: getStatusColor(article.isPublished),
                          }}
                        >
                          {getStatusText(article.isPublished)}
                        </span>
                      </div>
                      <h3 className="mobile-card-title">{article.title}</h3>
                      {article.summary && (
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--text-secondary)",
                            marginTop: "0.5rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {article.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mobile-card-details">
                    <span>
                      <FileText size={14} />
                      {article.categoryName}
                    </span>
                    <span>
                      <User size={14} />
                      {article.authorName}
                    </span>
                    <span>
                      <Calendar size={14} />
                      {formatDate(article)}
                    </span>
                    <span>
                      <Eye size={14} />
                      {article.viewCount}
                    </span>
                  </div>

                  <div className="mobile-card-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() =>
                        navigate(`/admin/clanci/uredi/${article.id}`)
                      }
                    >
                      <Edit size={16} />
                      Uredi
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        handleDeleteClick(article.id, article.title)
                      }
                    >
                      <Trash2 size={16} />
                      Obriši
                    </button>
                    {article.isPublished && (
                      <button
                        className="btn btn-outline"
                        onClick={() =>
                          window.open(`/clanak/${article.slug}`, "_blank")
                        }
                      >
                        <Eye size={16} />
                        Pogledaj
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {page > 1 && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPage(page - 1)}
                  >
                    Prethodna
                  </button>
                )}
                <span className="page-info">
                  Stranica {page} od {totalPages}
                </span>
                {page < totalPages && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPage(page + 1)}
                  >
                    Sljedeća
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <FileText size={48} color="var(--text-secondary)" />
            <p style={{ color: "var(--text-secondary)", margin: "1rem 0" }}>
              {filter === "all" && "Nema članaka za prikaz"}
              {filter === "published" && "Nema objavljenih članaka"}
              {filter === "draft" && "Nema draft članaka"}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/clanci/novi")}
            >
              <Plus size={18} />
              Kreiraj novi članak
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminArticles;
