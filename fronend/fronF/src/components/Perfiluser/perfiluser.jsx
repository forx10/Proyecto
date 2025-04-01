import { useState, useEffect } from "react";
import Navbaruser from "../Navbaruser/navbaruser";
import Footer from "../Footer/footer";
import Cookies from "js-cookie";  // Asegúrate de que esta línea esté presente



const styles={
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
    input:{
        fontFamily: "'Montserrat', sans-serif"
    }
}


function Perfiluser() {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8000/perfil/", {
          method: "GET",
          credentials: "include", // to send cookies with the request (if needed)
          headers: {
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        if (response.ok) {
          // Set profile data into state
          setName(data.usuario.first_name);
          setLastName(data.usuario.last_name );  // Usar '' si no está disponible
          setEmail(data.usuario.email);
        } else {
          alert(data.message || "Error fetching profile data");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
   

    fetchProfile();
  }, []);

  const handleLogout = async () => {
      try {
        const response = await fetch("http://localhost:8000/logout/", {
          method: "POST",
          credentials: "include", // Incluir cookies de sesión en la solicitud
        });
    
        if (response.ok) {
          // Eliminar las cookies localmente
          Cookies.remove("sessionid"); // o cualquier otra cookie
          Cookies.remove("csrftoken"); 
          window.location.href = "/dashprincipal"; // Redirigir al login
        } else {
          console.error("Error al hacer logout");
        }
      } catch (error) {
        console.error("Error de conexión al servidor", error);
      }
    };

  return (
    <div style={styles.container}>
        <div className="container mt-5">
            <Navbaruser/>
            <div className="row g-4 mt-5 mb-5">
                {/* Card de datos del usuario */}
                <div className="col-md-6 ">
                    <div className="card p-4 shadow-sm bg-light ">
                        <h2 className="h4 mb-3 text-center fw-bold" style={{color: "#4b2215"}}>Mi perfil</h2>
                        <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            style={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre"
                        />
                        </div>
                        <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            style={styles.input}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Apellido"
                        />
                        </div>
                        <div className="mb-3">
                        <input
                            type="email"
                            className="form-control"
                            style={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Correo electrónico"
                        />
                        </div>
                       
                    </div>
                </div>


                {/* Card de cerrar sesión con imagen */}
                <div className="col-md-6">
                <div className="card p-4 shadow-sm text-center bg-light">
                    {/* Espacio para imagen */}
                    <img
                        src="imagenes/perfiledit.png"
                        alt="Perfil"
                        className="rounded-circle mx-auto d-block"
                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                    <button className="btn fw-bold w-100 mt-4"  
                    style={{backgroundColor:"#c65b4a", fontFamily: "'Montserrat', sans-serif", color: "#4b2215"}} onClick={handleLogout }> 
                    Cerrar Sesión
                    </button>
                </div>
                </div>
            </div>
        </div>
        <div style={styles.footerContainer}>
            <Footer/>
        </div>
    </div>
  );
}


export default Perfiluser;