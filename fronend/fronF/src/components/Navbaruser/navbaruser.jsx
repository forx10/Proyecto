import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

function Navbaruser() {
  const [showNavbar, setShowNavbar] = useState(true);
  let lastScrollY = window.scrollY;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // Si el usuario hace scroll hacia abajo, ocultar el navbar
        setShowNavbar(false);
      } else {
        // Si el usuario hace scroll hacia arriba, mostrar el navbar
        setShowNavbar(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const styles = {
    navbar: {
      background: "linear-gradient(to right, #f4b183, #f8d8a8)",
      fontFamily: "'Montserrat', sans-serif",
      transition: "top 0.3s ease-in-out",
      position: "fixed",
      top: showNavbar ? "0" : "-80px", // Desaparece al hacer scroll hacia abajo
      left: 0,
      width: "100%",
      zIndex: 1000,
    },
    brand: {
      fontWeight: "bold",
      color: "#dc3545",
    },
    link: {
      color: "#4b2215",
      fontWeight: "bold",
    },
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light" style={styles.navbar}>
      <div className="container-fluid">
        <a className="navbar-brand" href="/dash_rol" style={styles.brand}>
          <img
            src="imagenes/iconoFragaria.png"
            alt="Fragaria Logo"
            width="40"
            height="40"
            className="me-2"
          />
          Fragaria
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav ms-4">
            <NavLink className="nav-link mx-2" to="/perfiluser" style={styles.link}>
              <img
                src="imagenes/usuario.png"
                alt="Perfil"
                width="30"
                height="30"
                className="me-1"
              />
              Perfil
            </NavLink>
            <NavLink
              className="nav-link mx-2"
              to="/cronograma_trabajador"
              style={styles.link}
            >
              <img
                src="imagenes/calendario.png"
                alt="Cronograma"
                width="30"
                height="30"
                className="me-1"
              />
              Cronograma
            </NavLink>
            
          
            <NavLink className="nav-link mx-2" to="/actividades_trabajador" style={styles.link}>
              <img
                src="imagenes/actividad.png"
                alt="Actividad"
                width="30"
                height="30"
                className="me-1"
              />
              Actividades
            </NavLink>
           
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbaruser;
