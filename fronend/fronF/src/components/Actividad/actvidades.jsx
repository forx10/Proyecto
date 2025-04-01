import { useState, useEffect, useCallback, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbaradmin from "../NavbarAdmin/Navadmin";
import Footer from "../Footer/footer";
import RegistroActividades from "../Registrar_actividad/registrar_actividad";

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

function Actividad_admin() {
  const [actividades, setActividades] = useState([]);
  const [editando, setEditando] = useState(null);
  const [editData, setEditData] = useState({ fecha: "", fecha_vencimiento: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch de las actividades
  const actividadGet = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/actividadAdmin/", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Error en la petición");

      const data = await response.json();

      if (Array.isArray(data.actividades)) {
        const actividadesTransformadas = data.actividades.map((act) => ({
          ...act,
          fecha: act.fecha.split(" ")[0], // Extraer solo la fecha (YYYY-MM-DD)
          fecha_vencimiento: act.fecha_vencimiento.split(" ")[0] || "", // Extraer fecha de vencimiento si existe
          usuario_nombre: act.usuario?.nombre || "Usuario desconocido", // Extraer el nombre del usuario
        }));

        setActividades(actividadesTransformadas);
      } else {
        console.error("Formato de respuesta incorrecto:", data);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    }
  }, []);

  

  // Llamada a la API solo una vez cuando el componente se monta
  useEffect(() => {
    actividadGet();
  }, [actividadGet]); // Dependencia de la función actividadGet


  // Habilitar edición
  const habilitarEdicion = (actividad) => {
    setEditando(actividad.id);
    setEditData({ fecha: actividad.fecha, fecha_vencimiento: actividad.fecha_vencimiento });
  };
  
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer); // Limpiar el temporizador al desmontar
    }
  }, [message]);

  // Guardar edición de actividad
  const guardarEdicion = async (id) => {
    try {
      const actividad = actividades.find((act) => act.id === id);
      if (!actividad) {
        console.error("No se encontró la actividad.");
        return;
      }

      setEditando(null);

      const response = await fetch(`http://localhost:8000/editar/${id}/`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha_vencimiento: editData.fecha_vencimiento,
          fecha: editData.fecha,
          estado: "incompleta",
        }),
      });
      
      if (response.ok) {
        setMessage({ type: "success", text: "Actividad actualizado con éxito" });
        actividadGet();
        return;
      }
    
    } catch (error) {
      console.error("Error al guardar la actividad:", error);
      setMessage({ type: "success", text: "Error al actualizado" });
    }
  };

  // Eliminar actividad
  const eliminarActividad = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/eliminar/${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Actividad eliminada correctamente" });
        setActividades((prev) => prev.filter((act) => act.id !== id));
      } else {
        console.error("Error:", await response.json());
        setMessage({ text: "Error al eliminar la plantación.", type: "danger" });
      }
    } catch (error) {
      console.error("Error al eliminar la actividad:", error);
      setMessage({ type: "danger", text: error.message });
    }
  };

  // Filtrar actividades por estado fuera del renderizado para optimizar rendimiento
  const actividadesPorEstado = useMemo(() => {
    return {
      pendiente: actividades.filter((act) => act.estado === "pendiente"),
      incompleta: actividades.filter((act) => act.estado === "incompleta"),
      completada: actividades.filter((act) => act.estado === "completada"),
    };
  }, [actividades]); // Solo se recalcula cuando las actividades cambian
  

  return (
    <div style={styles.container}>
      <Navbaradmin />
      <div className="container-fluid mt-5">
        <h2 className="text-center fw-bold mt-5" style={{ color: "#4b2215" }}>
          📌 Gestión de Actividades
        </h2>

              
        {message.text && (
          <div className={`alert alert-${message.type} text-center mx-auto`} role="alert" style={{ maxWidth: '500px' }}>
            {message.text}
          </div>
        )}

        <RegistroActividades onActividadAgregada={actividadGet} />
        <div className="row g-4">
          {["pendiente", "incompleta", "completada"].map((estado) => {
            const estadoInfo = {
              pendiente: { titulo: "📌 Pendientes", color: "#febd30", borde: "#f7dc6f" },
              incompleta: { titulo: "❌ Incompletas", color: "#c65b4a", borde: "#c65b4a" },
              completada: { titulo: "✅ Completadas", color: "#28b463", borde: "#1e8449" },
            };

            return (
              <div className="col-md-4" key={estado}>
                <section className="p-3 border rounded shadow bg-light mb-5">
                  <h4 className="text-center mb-3" style={{ color: estadoInfo[estado].color }}>
                    {estadoInfo[estado].titulo}
                  </h4>
                  <div className="overflow-auto" style={{ maxHeight: "400px" }}>
                    {actividadesPorEstado[estado].map((act) => (
                      <div key={act.id} className="card shadow-sm mb-3" style={{ border: `2px solid ${estadoInfo[estado].borde}` }}>
                        <div className="card-body text-center">
                          <h6 className="fw-bold text-dark">{act.nombre_actividad}</h6>
                          <p className="text-muted">👤 Usuario: {act.first_name}</p>
                          <p className="text-muted">🌱  plantacion: {act.nombre_plantacion}</p>

                          {editando === act.id ? (
                            <>
                              <label className="form-label">📅 Fecha de actividad:</label>
                              <input
                                type="date"
                                className="form-control mb-2"
                                value={editData.fecha}
                                onChange={(e) => setEditData({ ...editData, fecha: e.target.value })}
                              />
                              <label className="form-label">⏳ Fecha de vencimiento:</label>
                              <input
                                type="date"
                                className="form-control mb-2"
                                value={editData.fecha_vencimiento}
                                onChange={(e) => setEditData({ ...editData, fecha_vencimiento: e.target.value })}
                              />
                            </>
                          ) : (
                            <>
                              <p className="text-muted">📅 Fecha: {act.fecha}</p>
                              <p className="text-muted">⏳ Vence: {act.fecha_vencimiento || "No definida"}</p>
                            </>
                          )}

                          {estado !== "completada" && (
                            <>
                              {editando === act.id ? (
                                <button className="btn btn-sm w-100 mb-2 btn-primary" onClick={() => guardarEdicion(act.id)}>
                                  💾 Guardar
                                </button>
                              ) : (
                                <button className="btn btn-sm w-100 btn-warning mb-2" onClick={() => habilitarEdicion(act)}>
                                  ✏️ Editar Fechas
                                </button>
                              )}
                              <button className="btn btn-sm w-100 btn-danger" onClick={() => eliminarActividad(act.id)}>
                                🗑️ Eliminar
                              </button>
                            </>
                          )}

                          {estado === "completada" && (
                            <>
                              <span className="badge bg-success text-dark">Completada</span>
                              <button className="btn btn-sm w-100 btn-danger mt-2" onClick={() => eliminarActividad(act.id)}>
                                🗑️ Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            );
          })}
        </div>
      </div>
      <div style={styles.footerContainer}>
        <Footer />
      </div>
    </div>
  );
}


export default Actividad_admin;
