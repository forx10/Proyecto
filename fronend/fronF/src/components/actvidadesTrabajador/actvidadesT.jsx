import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbaruser from "../Navbaruser/navbaruser";
import Footer from "../Footer/footer";

const styles = {
  container: {
    minHeight: "100vh",
    minWidth: "100%",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(to bottom, rgb(252, 234, 208), rgb(255, 222, 199))",
  },
  footerContainer: {
    textAlign: "center",
    width: "100%",
    marginTop: "auto",
  },
};

function ActividadesT() {
  const [actividades, setActividades] = useState([]);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    const actividadGet = async () => {
      try {
        const response = await fetch("http://localhost:8000/actividades_de_trabajador/", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (response.ok) {
          setActividades(data.actividades || []); // Asegurar que sea un array
        } else {
          console.error("Error al obtener actividades:", data);
        }
      } catch (error) {
        console.error("Error en la conexión:", error);
      }
    };

    actividadGet();
  }, []); // Se ejecuta solo una vez al montar el componente

  // Nuevo useEffect para hacer que el mensaje desaparezca
  useEffect(() => {
    if (mensajeError) {
      const timer = setTimeout(() => {
        setMensajeError("");
      }, 3000); // Desaparece después de 3 segundos

      return () => clearTimeout(timer); // Limpia el temporizador si el estado cambia antes de los 3 segundos
    }
  }, [mensajeError]);

  const marcarComoCompletada = async (id) => {
    try {
      const response = await fetch("http://localhost:8000/marca/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (response.ok) {
        setActividades((prev) =>
          prev.map((act) => (act.id === id ? { ...act, estado: "completada" } : act))
        );
        setMensajeError(""); // Limpia el error si la operación es exitosa
      } else {
        setMensajeError(data.error || "No se puede completar la actividad.");
      }
    } catch (error) {
      setMensajeError("Error en la conexión con el servidor.");
    }
  };

  return (
    <div style={styles.container}>
      <div className="container mt-5 mb-5">
        <Navbaruser />
        <h2 className="text-center fw-bold mb-5 mt-5" style={{ color: "#4b2215" }}>
          📌 Gestión de Actividades
        </h2>

        {/* Mensaje de error en rojo */}
        {mensajeError && (
          <p style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>{mensajeError}</p>
        )}

        <div className="row g-4">
          {/* Actividades pendientes */}
          <div className="col-md-4">
            <section className="p-3 border rounded shadow-sm bg-light">
              <h4 className="text-center mb-3" style={{ color: "#febd30" }}>📌 Pendientes</h4>
              <div className="overflow-auto" style={{ maxHeight: "400px" }}>
                {actividades.length > 0 ? (
                  actividades
                    .filter((act) => act.estado === "pendiente")
                    .map((act) => (
                      <div key={act.id} className="card shadow-sm mb-3" style={{ border: "2px solid #f7dc6f" }}>
                        <div className="card-body text-center">
                          <h6 className="fw-bold" style={{ color: "#8B0000" }}>{act.nombre_actividad}</h6>
                          <p className="text-muted">🌱 Plantación: {act.nombre_plantacion}</p>
                          <p className="text-muted">📅 {act.fecha}</p>
                          <p className="text-muted">⏳ {act.fecha_vencimiento}</p>
                          <button
                            className="btn btn-sm w-100 mb-2"
                            style={{ backgroundColor: "#28b463", fontFamily: "'Montserrat', sans-serif" }}
                            onClick={() => marcarComoCompletada(act.id)}
                          >
                            ✅ Completar
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <p>No hay actividades pendientes.</p>
                )}
              </div>
            </section>
          </div>

          {/* Actividades incompletas */}
          <div className="col-md-4">
            <section className="p-3 border rounded shadow-sm bg-light">
              <h4 className="text-center mb-3" style={{ color: "#c65b4a" }}>❌ Incompletas</h4>
              <div className="overflow-auto" style={{ maxHeight: "400px" }}>
                {actividades.length > 0 ? (
                  actividades
                    .filter((act) => act.estado === "incompleta")
                    .map((act) => (
                      <div key={act.id} className="card shadow-sm mb-3" style={{ border: "2px solid #c65b4a" }}>
                        <div className="card-body text-center">
                          <h6 className="fw-bold" style={{ color: "#8B0000" }}>{act.nombre_actividad}</h6>
                          <p className="text-muted">🌱 Plantación: {act.nombre_plantacion}</p>
                          <p className="text-muted">📅 {act.fecha}</p>
                          <p className="text-muted">⏳ {act.fecha_vencimiento}</p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p>No hay actividades incompletas.</p>
                )}
              </div>
            </section>
          </div>

          {/* Actividades completadas */}
          <div className="col-md-4">
            <section className="p-3 border rounded shadow-sm bg-light">
              <h4 className="text-success text-center mb-3">✅ Completadas</h4>
              <div className="overflow-auto" style={{ maxHeight: "400px" }}>
                {actividades.length > 0 ? (
                  actividades
                    .filter((act) => act.estado === "completada")
                    .map((act) => (
                      <div key={act.id} className="card shadow-sm mb-3" style={{ border: "2px solid #1e8449" }}>
                        <div className="card-body text-center">
                          <h6 className="fw-bold" style={{ color: "#8B0000" }}>{act.nombre_actividad}</h6>
                          <p className="text-muted">🌱 Plantación: {act.nombre_plantacion}</p>
                          <p className="text-muted">📅 {act.fecha}</p>
                          <p className="text-muted">⏳ {act.fecha_vencimiento}</p>
                          <span className="badge bg-success text-dark">Completada</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p>No hay actividades completadas.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      <div style={styles.footerContainer}>
        <Footer />
      </div>
    </div>
  );
}

export default ActividadesT;
