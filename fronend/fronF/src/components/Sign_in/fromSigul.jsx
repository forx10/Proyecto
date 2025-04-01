import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from '../Footer/footer';

function FromSigul() {
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", password1: "", password2: ""
  });

  
  const [showPasswords, setShowPasswords] = useState({
    password1: false, password2: false
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});

  const handleInputChange = (key, value) => {
    setFormData(prevData => ({ ...prevData, [key]: value }));

    // Elimina el mensaje de error si el usuario empieza a escribir
    setErrors(prevErrors => ({ ...prevErrors, [key]: "" }));
  };

 

  const handleValidations = async () => {
    let formErrors = {};
    const { first_name, last_name, email, password1, password2 } = formData;
    const isValidEmail = email => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(email);
   

  
    // Validaciones de los campos obligatorios
    if (!first_name) formErrors.first_name = "El nombre es obligatorio.";
    if (!last_name) formErrors.last_name = "El apellido es obligatorio.";
    if (!email) {
      formErrors.email = "El correo es obligatorio.";
    } else if (!isValidEmail(email)) {
      formErrors.email = "Correo electrónico no válido.";
    }
    if (!password1) formErrors.password1 = "La contraseña es obligatoria.";
    if (!password2) formErrors.password2 = "Debes confirmar la contraseña.";
    if (password1 && password2 && password1 !== password2) {
      formErrors.password2 = "Las contraseñas no coinciden.";
    }
  
    // Si hay errores, detener la ejecución y mostrarlos
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
  
    try {
      const requestData = { first_name, last_name, email, password1, password2 };
  
      const response = await fetch('http://localhost:8000/registro/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setMessage({ text: "Registro exitoso. Ahora puedes iniciar sesión.", type: "success" });
        setFormData({ first_name: "", last_name: "", email: "", password1: "", password2: "" });
        setTimeout(() => {
          window.location.href = "/dashprincipal";
        }, 3000); // Redirigir después de 3 segundos
      } else {
        setMessage({ text: data.errors ? Object.values(data.errors).join(", ") : "Error en el registro.", type: "danger" });
      }
    } catch {
      setMessage({ text: "Error en la solicitud. Intenta nuevamente.", type: "danger" });
    }
  };
  
  const togglePasswordVisibility = field => {
    setShowPasswords(prevState => ({ ...prevState, [field]: !prevState[field] }));
  };

  const styles = {
    body: {
      background: "linear-gradient(to bottom,rgb(252, 234, 208),rgb(255, 222, 199))",
      minHeight: "100vh",
      justifyContent: "center",
      alignItems: "center"
    },
    navbar: {
      background: "linear-gradient(to right, #f4b183, #f8d8a8)",
      color: "white",
      padding: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    },
    navbarTitle: {
      flexGrow: 1.5,
      textAlign: "center",
      fontSize: "30px",
      fontWeight: "bold",
      fontFamily: "'Montserrat', sans-serif",
      color: "#dc3545",
      justifyContent: "center"
    },
    backButton: {
      background: "none",
      border: "none",
      fontSize: "18px",
      cursor: "pointer",
      color: "#dc3545",
      marginLeft: "10px"
    },
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh"
    },
    card: {
      width: '450px',
      background: 'linear-gradient(to right, #f4b183, #f8d8a8)',
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      maxWidth: "85%"
    },
    button: {
      backgroundColor: "#d17c53",
      color: "#ffff",
      width: "100%",
      borderRadius: "50px",
      fontFamily: "'Montserrat', sans-serif",
    },
    footerContainer: {
      flexShrink: 0,
    }
  };

  return (
    <div style={styles.body}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <button style={styles.backButton} onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <span style={styles.navbarTitle}>Fragaria</span>
      </nav>

      <div style={styles.container}>
        <div style={styles.card}>
      
          <img 
            src="imagenes/iconoFragaria.png"
            alt="Logo Fragaria"
            className="logo-fragaria d-block mx-auto"
          />
          <h2 className="text-center mb-4 fw-bold" style={{ color: "#dc3545" }}>Registro</h2>

              {/* Mostrar mensajes de éxito o error */}
              {message.text && (
                <div className={`alert alert-${message.type} text-center`} role="alert">
                  {message.text}
                </div>
              )}

          <form>
              {["first_name", "last_name", "email"].map(field => (
                <div key={field} className="mb-3">
                  <input
                    value={formData[field] || ""} 
                    type={field === "email" ? "email" : "text"}
                    className={`form-control border-2 rounded-pill ${errors[field] ? "is-invalid" : ""}`}
                    placeholder={field === "email" ? "Correo electrónico" : (field === "first_name" ? "Nombre" : "Apellido")}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                  />
                  {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
                </div>
              ))}


            {["password1", "password2"].map(field => (
              <div key={field} className="mb-3 position-relative">
                <input
                  value={formData[field] || ""} 
                  type={showPasswords[field] ? "text" : "password"}
                  className={`form-control border-2 rounded-pill ${errors[field] ? "is-invalid" : ""}`}
                  placeholder={field === "password2" ? "Confirmar contraseña" : "Contraseña"}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                />
                {formData[field] && (
                  <button
                    type="button"
                    className="btn position-absolute end-0 translate-middle-y me-3 rounded-circle"
                    style={{ top: "50%", border: "none", color: "#7d3c2a" }}
                    onClick={() => togglePasswordVisibility(field)}
                  >
                    <i className={`fa ${showPasswords[field] ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                )}
                {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
              </div>
            ))}

            <button 
              type="button" 
              className="btn w-100 rounded-pill fw-bold" 
              style={styles.button}
              onClick={handleValidations}
            >
              Registrarse
            </button>
          </form>
        </div>
      </div>

      <div style={styles.footerContainer} className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default FromSigul;

