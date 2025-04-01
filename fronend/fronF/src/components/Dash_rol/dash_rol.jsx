import { useState, useEffect } from "react";
import Navbaradmin from "../NavbarAdmin/Navadmin";
import Navbaruser from "../Navbaruser/navbaruser";
import Footer from "../Footer/footer";



const styles = {
  container: {
    minHeight: "100vh",
    minWidth: "100%", // <-- Aquí lo agregas
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

function Dash_rol() {
  const [name, setName] = useState("Usuario");
  const [setError] = useState("");
  const [clima, setClima] = useState(null);
  const [mostrarClima, setMostrarClima] = useState(false);
 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8000/perfil/", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        if (response.ok) {
          setName(data.usuario.first_name);
        } else {
          setError(data.message || "Error al obtener el perfil");
        }
      } catch (error) {
        console.error("Error al obtener perfil:", error);
        setError("Error al obtener perfil.");
      }
    };

    fetchProfile();
  }, []);

  const climaGet = async () => {
    try {
      const response = await fetch("http://localhost:8000/clima/", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (response.ok) {
        setClima(data.clima);
      } else {
        console.log("error al obtener datos")
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  }; 
  useEffect(() => {
    climaGet();
  },[]);



  const esAdmin = localStorage.getItem("is_staff") === "true";

  return (
    <div style={styles.container}>
      <div className="d-flex flex-column">
           {/* Navbar según el rol */}
        {esAdmin ? <Navbaradmin/> : <Navbaruser/>}
        <div className="container text-center mt-5 my-5">
          <h2 className="fw-bold mt-5" style={{ color: "#4b2215"}}>¡ Hola, {name} !</h2>
          <p className="fs-4 fw-bold fst-italic mt-5 mb-5" style={{ color: "#4b2215"}}>
            Fragaria: Tecnología y naturaleza al servicio de los agricultores.
          </p>

          {/* Carrusel de imágenes con consejos esenciales para fresas */}
          <div className="mx-auto" style={{ maxWidth: "800px" }}>
            <div id="carouselFresas" className="carousel slide mt-4" data-bs-ride="carousel">
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <img src="/imagenes/carrusel1.jpg" className="d-block w-100 rounded img-fluid" alt="Ubicación y suelo adecuado"  style={{ height: "300px", objectFit: "cover" }} />
                  <div className="carousel-caption d-block bg-dark bg-opacity-50 p-2 rounded">
                    <h5 >Ubicación y suelo adecuado</h5>
                    <p>Planta en suelos bien drenados y ricos en materia orgánica.</p>
                  </div>
                </div>
                <div className="carousel-item">
                  <img src="/imagenes/carrusel2.jpg" className="d-block w-100 rounded img-fluid" alt="Luz solar"  style={{ height: "300px", objectFit: "cover" }} />
                  <div className="carousel-caption d-block bg-dark bg-opacity-50 p-2 rounded">
                    <h5>Luz solar</h5>
                    <p>Las fresas necesitan al menos 6-8 horas de sol al día.</p>
                  </div>
                </div>
                <div className="carousel-item">
                  <img src="/imagenes/carrusel3.jpg" className="d-block w-100 rounded img-fluid" alt="Riego adecuado"  style={{ height: "300px", objectFit: "cover" }} />
                  <div className="carousel-caption d-block bg-dark bg-opacity-50 p-2 rounded">
                    <h5>Riego adecuado</h5>
                    <p>Riega en la mañana para evitar hongos y mantén el suelo húmedo.</p>
                  </div>
                </div>
                <div className="carousel-item">
                  <img src="/imagenes/carrusel4.jpg" className="d-block w-100 rounded img-fluid" alt="Cosecha en el momento justo"  style={{ height: "300px", objectFit: "cover" }} />
                  <div className="carousel-caption d-block bg-dark bg-opacity-50 p-2 rounded">
                    <h5>Cosecha en el momento justo</h5>
                    <p>Recolecta cuando las fresas estén completamente rojas para mejor sabor.</p>
                  </div>
                </div>
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#carouselFresas" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Anterior</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#carouselFresas" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Siguiente</span>
              </button>
            </div>
          </div>
          
        </div>
        {/* Botón flotante en la esquina inferior derecha */}
        <button
        className="btn btn-warning rounded-circle position-fixed"
        style={{
          width: "60px",
          height: "60px",
          fontSize: "24px",
          bottom: "calc(80px + 15px)", // Asegura que el botón esté encima del footer
          right: "15px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          zIndex: 1050, // Asegura que esté sobre otros elementos
        }}
        onClick={() => setMostrarClima(!mostrarClima)}
      >
        🌞
      </button>

      {/* Tarjeta del clima flotante */}
      {mostrarClima && clima && (
        <div
          className="position-fixed bg-light p-3 rounded shadow border"
          style={{
            bottom: "90px",
            right: "20px",
            maxWidth: "250px",
          }}
        >
          <h4>Datos del Clima</h4>
          <p><strong>Temperatura:</strong> {clima.temperatura}°C</p>
          <p><strong>Descripción:</strong> {clima.descripcion}</p>
          <p><strong>Humedad:</strong> {clima.humedad}%</p>
          <p><strong>Presión:</strong> {clima.presion} hPa</p>
          <p><strong>Velocidad del Viento:</strong> {clima.velocidad_viento} m/s</p>
        </div>
      )}


      </div>
        <div style={styles.footerContainer}>
          <Footer />
        </div>
    </div>
    
  );
}

export default  Dash_rol;
