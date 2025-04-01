import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Mejora la obtención de parámetros
import Footer from "../Footer/footer";
import 'bootstrap/dist/css/bootstrap.min.css';

function Password() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ password: "", confirmation: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [uidb64, setUid] = useState("");
  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [isTypingConfirmation, setIsTypingConfirmation] = useState(false);

  useEffect(() => {
    const uid = searchParams.get("uid64");
    const tk = searchParams.get("token");

    if (!uid || !tk) {
      setMessage("❌ Error: URL inválida. Falta el token o el identificador.");
    } else {
      setUid(uid);
      setToken(tk);
    }
  }, [searchParams]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    if (field === "password") {
      setIsTypingPassword(value.length > 0);
    } else if (field === "confirmation") {
      setIsTypingConfirmation(value.length > 0);
    }
  };

  const handlePasswordFormSubmit = async (e) => {
    e.preventDefault();

    if (!uidb64 || !token) {
      setMessage("❌ Error: No se pudo obtener la información de restablecimiento.");
      return;
    }

    let formErrors = {};
    const { password, confirmation } = formData;

    
    if (!password) {
      formErrors.password = "La contraseña es obligatoria.";
  } else if (password.length < 8) {
      formErrors.password = "La contraseña debe tener al menos 8 caracteres.";
  }

    if (!confirmation) formErrors.confirmation = "La confirmación es obligatoria.";
    else if (password !== confirmation) formErrors.confirmation = "Las contraseñas no coinciden.";

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setMessage("Procesando...");

    try {
      const response = await fetch(`http://localhost:8000/reset/${uidb64}/${token}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_password1: password,
          new_password2: confirmation
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Contraseña restablecida con éxito.");
        setTimeout(() => {
          window.location.href = "/dashprincipal";
        }, 2000);
      } else {
        setMessage(`❌ Error: ${data.message || "Error desconocido."}`);
      }
    } catch (error) {
      setMessage(`❌ Error en la conexión: ${error.message}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(to bottom, rgb(252, 234, 208), rgb(255, 222, 199))" }}>

      <nav style={{ background: "linear-gradient(to right, #f4b183, #f8d8a8)", color: "white", padding: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#dc3545", marginLeft: "10px" }} onClick={() =>window.location.href ="/dashprincipal"}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <span style={{ flexGrow: 1.5, textAlign: "center", fontSize: "30px", fontWeight: "bold", fontFamily: "'Montserrat', sans-serif", color: "#dc3545", justifyContent: "center" }}>
          Fragaria
        </span>
      </nav>

      <div className="d-flex justify-content-center align-items-center flex-grow-1 mt-5 mb-5">
        <div className="card p-4 shadow-lg rounded-4" style={{ width: "400px", maxWidth: "85%", background: "linear-gradient(to right, #f4b183, #f8d8a8)"}}>
          <h2 className="text-center mb-4 fw-bold" style={{ color: "#dc3545" }}>
            Nueva contraseña
          </h2>

          <form onSubmit={handlePasswordFormSubmit}>
            <div className="mb-3 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control border-2 rounded-pill ${errors.password ? "is-invalid" : ""}`}
                placeholder="Nueva contraseña"
                value={formData.password}
                onChange={(e) => {
                  handleInputChange("password", e.target.value);
                  setErrors((prevErrors) => ({ ...prevErrors, password: "" })); // Oculta el mensaje de error al escribir
                }}
              />
              {!errors.password && formData.password.length > 0 &&(
                <button
                  type="button"
                  className="btn position-absolute end-0 translate-middle-y me-3"
                  style={{ top: "50%", transform: "translateY(-50%)", border: "none", color: "#7d3c2a" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              )}
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="mb-3 position-relative">
              <input
                type={showConfirmation ? "text" : "password"}
                className={`form-control border-2 rounded-pill ${errors.confirmation ? "is-invalid" : ""}`}
                placeholder="Confirmar contraseña"
                value={formData.confirmation}
                onChange={(e) => {
                  handleInputChange("confirmation", e.target.value);
                  setErrors((prevErrors) => ({ ...prevErrors, confirmation: "" })); // Oculta el mensaje de error al escribir
                }}
              />
              {!errors.confirmation && formData.confirmation.length > 0 &&(
                <button
                  type="button"
                  className="btn position-absolute end-0 translate-middle-y me-3"
                  style={{ top: "50%", transform: "translateY(-50%)", border: "none", color: "#7d3c2a" }}
                  onClick={() => setShowConfirmation(!showConfirmation)}
                  
                >
                  <i className={`fas ${showConfirmation ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              )}
              {errors.confirmation && <div className="invalid-feedback">{errors.confirmation}</div>}
            </div>

            {message && <div className="alert alert-danger text-center">{message}</div>}

            <button
              type="submit"
              className="btn w-100 rounded-pill fw-bold"
              style={{ backgroundColor: "#d17c53", color: "#fff" }}
            >
              Guardar
            </button>
          </form>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default Password;
