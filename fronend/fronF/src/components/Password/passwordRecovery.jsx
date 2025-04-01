import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Footer from "../Footer/footer";

function PasswordRecuper() {
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({ email: "" });
  const [currentForm, setCurrentForm] = useState("emailForm");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // Mensaje de éxito o error

  const handleInputChange = (key, value) => {
    setFormData((prevData) => ({ ...prevData, [key]: value }));

    if (errors[key]) {
      setErrors((prevErrors) => ({ ...prevErrors, [key]: "" }));
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailFormSubmit = async () => {
    let formErrors = {};
    const { email } = formData;

    if (!email) {
      formErrors.email = "Es obligatorio.";
    } else if (!isValidEmail(email)) {
      formErrors.email = "Correo electrónico no válido.";
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setMessage(""); // Resetear mensaje antes de la solicitud

    try {
      const response = await fetch("http://127.0.0.1:8000/password-reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Error al analizar JSON:", jsonError);
        data = {};
      }
    
      if (response.ok) {
        setMessage("Se ha enviado un enlace de recuperación a tu correo.");
        setCurrentForm("passwordForm");
      } else {
        setErrors({ email: data?.error || "Error al enviar el correo." });
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setErrors({ email: "Hubo un problema de conexión." });
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
     
      <nav style={{ background: "linear-gradient(to right, #f4b183, #f8d8a8)", color: "white", padding: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#dc3545", marginLeft: "10px" }} onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <span style={{ flexGrow: 1.5, textAlign: "center", fontSize: "30px", fontWeight: "bold", fontFamily: "'Montserrat', sans-serif", color: "#dc3545", justifyContent: "center" }}>
          Fragaria
        </span>
      </nav>

      {/* Contenido */}
      <div className="d-flex justify-content-center align-items-center flex-grow-1" style={{background: "linear-gradient(to bottom, rgb(252, 234, 208), rgb(255, 222, 199))",}}>
        <div className="card p-4 shadow-lg rounded-4" style={{ width: "400px", background: "linear-gradient(to right, #f4b183, #f8d8a8)", maxWidth: "85%" }}>
          {currentForm === "emailForm" && (
            <>
              <h2 className="text-center mb-4 fw-bold" style={{ color: "#dc3545" }}>
                Recuperación de contraseña
              </h2>
              <div className="mb-3">
                <input
                  type="email"
                  className={`form-control border-2 rounded-pill ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Correo electrónico"
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              {message && <p className="text-success text-center">{message}</p>}
              <button className="btn w-100 rounded-pill fw-bold" style={{ backgroundColor: "#d17c53", color: "#fff" }} onClick={handleEmailFormSubmit} disabled={loading}>
                {loading ? "Enviando..." : "Continuar"}
              </button>
            </>
          )}

          {currentForm === "passwordForm" && (
            <h3 className="text-center text-success">{message}</h3>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default PasswordRecuper;
  