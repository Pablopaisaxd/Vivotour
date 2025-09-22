import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import "./style/Opinion.css";

import imgs1 from "../../assets/Fondos/columpio delante.jpg";
import imgs2 from "../../assets/Fondos/turista acostado en hamaca.jpg";
import imgs3 from "../../assets/Fondos/turistas en rio 2.jpg";
import imgs4 from "../../assets/Fondos/columpio detras.jpg";
import imgs5 from "../../assets/Fondos/turistas en rio.jpg";

import imgs7 from "../../assets/Personas/Persona.png";



const Opinion = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [opinionText, setOpinionText] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [opinions, setOpinions] = useState([]);
  const [allOpinions, setAllOpinions] = useState([]); 
  const [currentPage, setCurrentPage] = useState(0); 

  const images = [imgs1, imgs2, imgs3, imgs4, imgs5];
  const opinionsPerPage = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % images.length
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
  const fetchOpinions = async () => {
    try {
      const res = await fetch("http://localhost:5000/ultimas-opiniones");
      const data = await res.json();
      if (data.success) {
        setOpinions(data.opiniones.map(op => ({ ...op, image: imgs7 })));
      }
    } catch (err) {
      console.error("Error cargando opiniones:", err);
    }
  };

  fetchOpinions();
}, []);

  const handleReservaClick = () => {
    if (isAuthenticated) {
      navigate("/Reserva");
    } else {
      navigate("/Login");
    }
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setOpinionText("");
    setNombre("");
    setError("");
  };


  const handleOpenAllModal = async () => {
    try {
      const res = await fetch("http://localhost:5000/opiniones");
      const data = await res.json();
      if (data.success) {
        setAllOpinions(data.opiniones.map(op => ({ ...op, image: imgs7 })));
        setCurrentPage(0); 
        setShowAllModal(true);
      }
    } catch (err) {
      console.error("Error cargando TODAS las opiniones:", err);
    }
  };
  const handleCloseAllModal = () => setShowAllModal(false);

  const handleSubmitOpinion = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/opinion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, opinion: opinionText }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.mensaje || "Error");

      setOpinions(data.opiniones.map(op => ({ ...op, image: imgs7 })));
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const startIndex = currentPage * opinionsPerPage;
  const currentOpinions = allOpinions.slice(
    startIndex,
    startIndex + opinionsPerPage
  );
  const totalPages = Math.ceil(allOpinions.length / opinionsPerPage);

  return (
    <section className="opinion" id="Descubre">
      <div className="opres">
        <div className="left-col">
          <div className="opimg" aria-hidden="false">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Fondo ${index + 1}`}
                className={
                  currentImageIndex === index ? "active" : "inactive"
                }
              />
            ))}
          </div>

          <div
            className="buttons-container"
            role="group"
            aria-label="Acciones"
          >
            <button
              className="btn btnreserva"
              onClick={handleReservaClick}
            >
              Reserva ahora
            </button>
            <button className="btn btnopina" onClick={handleOpenModal}>
              ¿Qué opinas?
            </button>
            <button className="btn btnver" onClick={handleOpenAllModal}>
              Ver todas
            </button>
          </div>
        </div>

        <div className="right-col">
          {opinions.length === 0 ? (
            <p>No hay opiniones aún. Sé el primero en opinar.</p>
          ) : (
            opinions.map((opinion, index) => (
              <article
                className={`comment ${
                  index % 2 === 1 ? "right" : "left"
                }`}
                key={index}
              >
                <div className="desper">
                  <div className="imgcircle">
                    <img
                      src={opinion.image || imgs7}
                      alt={opinion.nombre}
                    />
                  </div>
                  <p className="comment-name">{opinion.nombre}</p>
                </div>
                <div className="opr">
                  <p className="comment-text">{opinion.opinion}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Agregar Opinión</h2>
            <form onSubmit={handleSubmitOpinion}>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
              <textarea
                placeholder="Escribe tu opinión"
                value={opinionText}
                onChange={(e) => setOpinionText(e.target.value)}
                required
              />
              {error && <p className="error">{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar"}
              </button>
              <button type="button" onClick={handleCloseModal}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {showAllModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <h2>Todas las Opiniones</h2>
            <div className="opinions-list">
              {currentOpinions.map((op, idx) => (
                <article key={idx} className="comment">
                  <div className="desper">
                    <div className="imgcircle">
                      <img src={op.image || imgs7} alt={op.nombre} />
                    </div>
                    <p className="comment-name">{op.nombre}</p>
                  </div>
                  <div className="opr">
                    <p className="comment-text">{op.opinion}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="pagination">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Anterior
              </button>
              <span>
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>

            <button className="btn-close" onClick={handleCloseAllModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Opinion;
