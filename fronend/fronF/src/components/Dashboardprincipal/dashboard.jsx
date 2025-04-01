import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./dashboard.css"; // Archivo CSS personalizado
import LoginForm from "../Login/fromLogin";
import Footer from "../Footer/footer"; // Importa el Footer


const styles = {
  footerContainer: {
    textAlign: "center",
    width: "100%",
    marginTop: "auto", 
  },
}

function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 992);
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate("/otra-interfaz"); // Redirige a otra interfaz
  };

  useEffect(() => {
    const handleResize = () => {
      document.body.style.maxWidth = "1200px"; // Establece un ancho máximo
      document.body.style.margin = "0 auto"; 
      const smallScreen = window.innerWidth <= 992;
      setIsSmallScreen(smallScreen);
      document.body.style.backgroundColor = smallScreen ? "#222" : "white"; 
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Llamada inicial

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <div className={`d-flex flex-column min-vh-100 ${isSmallScreen ? "single-screen" : ""}`}>
        <div className={`main-content ${isSmallScreen ? "single-content" : ""}`}>
          {!isSmallScreen ? (
            <>
              <div className="left-side">
                <div className="illustration-container">
                  < img 
                    src="imagenes/ilustracion.png"
                    alt="Ilustración de bienvenida"
                    className="img-fluid d-none d-lg-block"
                  />
                </div>
              </div>
              <div className="right-side">
                {!isLoggedIn ? (
                  <LoginForm/>
                ) : (
                  <div className="dashboard-content">
                    <h1>Bienvenido al Dashboard</h1>
                    <p>Aquí va el contenido principal de tu página de Dashboard.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="full-screen-content">
              {!isLoggedIn ? (
                <LoginForm onLogin={handleLoginSuccess} />
              ) : (
                <div className="dashboard-content">
                  <h1>Bienvenido al Dashboard</h1>
                  <p>Aquí va el contenido principal de tu página de Dashboard.</p>
                </div>
              )}
            </div>
          )}
            
        </div>
        <Footer style={styles.footerContainer} />
          
        
      </div>
    </div>
  );
}

export default Dashboard;