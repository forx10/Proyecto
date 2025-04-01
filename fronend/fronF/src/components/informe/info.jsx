import { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbaradmin from "../NavbarAdmin/Navadmin";
import Footer from "../Footer/footer";

const styles = {
  container: {
    minHeight: "100vh",
    minWidth: "100%", // <-- Aquí lo agregas
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(to bottom, rgb(252, 234, 208), rgb(255, 222, 199))",
  },
  card: {
    borderRadius: "10px",
    border: "2px solid rgba(83, 83, 83, 0.2)",
  },
  footerContainer: {
    textAlign: "center",
    width: "100%",
    marginTop: "auto",
  },
};

function Informes() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mensaje, setMensaje] = useState(null);


  useEffect(() => {
    const fetchTrabajadores = async () => {
      try {
        const response = await fetch("http://localhost:8000/informe/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
  
        if (!response.ok) throw new Error("Error en la respuesta del servidor");
  
        const data = await response.json();
        console.log("Datos recibidos:", data);
  
        if (data?.actividades && Array.isArray(data.actividades)) {
          // Agrupar actividades por trabajador
          const grouped = data.actividades.reduce((acc, actividad) => {
            const key = actividad.usuario__first_name;
            if (!acc[key]) {
              acc[key] = {
                id: actividad.id, // Puedes usar el primer ID o generar uno único
                usuario: actividad.usuario__first_name,
                actividades: []
              };
            }
            acc[key].actividades.push({
              id: actividad.id,
              nombre_actividad: actividad.nombre_actividad,
              descripcion: actividad.descripcion,
              fecha: actividad.fecha,
              estado: actividad.estado,
              plantacion__nombre: actividad.plantacion__nombre
            });
            return acc;
          }, {});
  
          setTrabajadores(Object.values(grouped));
        } else {
          setTrabajadores([]);
        }
      } catch (error) {
        console.error("Error al obtener los informes:", error);
        setTrabajadores([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrabajadores();
  }, []);

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("http://localhost:8000/descargar_informes_pdf/", {
        method: "GET",
        credentials: "include",
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al descargar el informe");
      }
  
      // Crear un enlace de descarga del PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "informes_trabajadores.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMensaje({ text: error.message, type: "warning" });
    }
  };

  const handleDelete = async (id) => {
    
    try {
      const response = await fetch(`http://localhost:8000/eliminar_informe/${id}/`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (!response.ok) throw new Error("Error al eliminar la actividad");

      // Actualiza el estado eliminando solo la actividad específica
      setTrabajadores(prev => prev.map(trabajador => ({
        ...trabajador,
        actividades: trabajador.actividades.filter(act => act.id !== id)
      })).filter(trabajador => trabajador.actividades.length > 0)); // Elimina trabajadores sin actividades

        //setTrabajadores(trabajadores.filter((actividad) => actividad.id !== id));
        setMensaje({ text: "Actividad eliminada con éxito", type: "success" });
    } catch (error) {
      console.error("Error al eliminar:", error);
      setMensaje({ text: "Error al eliminar la actividad", type: "danger" });
    }
    setTimeout(() => setMensaje(null), 3000);
  };
  
  // Filtrar trabajadores según la búsqueda
  const trabajadoresFiltrados = trabajadores.filter((trabajador) =>
    trabajador.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />
      <Navbaradmin />

      <h2 className="text-center fw-bold mb-4 mt-5 pt-5" style={{color: "#4b2215" }}>
        📊 Actividades de Trabajadores
      </h2>
      

      {/* Barra de búsqueda (sin botón de lupa) */}
      <div className="container mb-5">
        <div className="input-group mx-auto" style={{ maxWidth: "400px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar trabajador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="text-center mb-4">
        <button
          onClick={handleDownloadPDF}
          style={{
            backgroundColor: "#d17c53",
            color: "#ffff",
            border: "2px solid rgb(255, 185, 153)",
            borderRadius: "25px",
            fontWeight: "bold",
            transition: "background-color 0.3s ease",
            minWidth: "250px",
            maxWidth: "300px",
            padding: "15px 20px",
            fontSize: "15px",
            boxShadow: "3px 3px 10px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#c06d48")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#d17c53")}
        >
          <i className="fas fa-file-pdf" style={{ marginRight: "10px" }}></i> Descargar PDF
        </button>
      </div>

        {mensaje?.text && (
          <div 
            className={`alert alert-${mensaje.type} text-center mx-auto`} 
            role="alert" 
            style={{ 
              maxWidth: "500px", 
              backgroundColor: "red",  // Fondo rojo 
              color: "white",  // Texto blanco para mejor visibilidad
              fontWeight: "bold",  // Texto en negrita
              padding: "10px",  // Espaciado interno
              borderRadius: "8px" // Bordes redondeados
            }}
          >
            {mensaje.text}
          </div>
        )}

      <div className="container">
        {isLoading ? (
          <p className="text-center">Cargando trabajadores...</p>
        ) : trabajadoresFiltrados.length > 0 ? (
          <div className="row justify-content-center">
            {trabajadoresFiltrados.map((trabajador) => (
              <div key={trabajador.id} className="col-md-6 col-lg-4 mb-5">
                <div className="card shadow-lg rounded-4 p-3 bg-white" style={styles.card}>
                  <div className="card-body text-center">
                    <h5 className="fw-bold" style={{ color: "#4b2215" }}>
                      {trabajador.usuario}
                    </h5>
                   
                    <div className="d-flex justify-content-center mt-3">
                    <button
                      type="button"
                      className="btn btn-outline-success mb-2"
                      onClick={() => setExpandedId(expandedId === trabajador.id ? null : trabajador.id)}
                    >
                      <i className={`fa ${expandedId === trabajador.id ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>

                    {expandedId === trabajador.id && (
                      <div className="mt-3">
                        <div className="scrollable-actividades" style={{ maxHeight: "300px", overflowY: "auto" }}>
                          {trabajador.actividades.map((actividad) => (
                            <div key={actividad.id} className="p-3 mb-2 border rounded">
                              <p className="fw-bold">{actividad.nombre_actividad}</p>
                              <p className="small"><strong>Descripción:</strong> {actividad.descripcion}</p>
                              <p className="small"><strong>Fecha:</strong> {actividad.fecha}</p>
                              <p className="small"><strong>Estado:</strong> {actividad.estado}</p>
                              <p className="text-muted small"><strong>Plantación:</strong> {actividad.plantacion__nombre}</p>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(actividad.id)}
                              >
                                <i className="fas fa-trash"></i> Eliminar
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">No hay actividades completadas registradas.</p>
        )}
      </div>

      <div style={styles.footerContainer}>
        <Footer />
      </div>
    </div>
  );
}

export default Informes;
