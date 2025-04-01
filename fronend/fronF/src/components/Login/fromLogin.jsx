import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Importa el CSS de Bootstrap
import { Link, useNavigate } from "react-router-dom"; // Para manejar la navegación
import "./fromLogin.css"; // Archivo CSS para los estilos personalizados

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null); // Estado para los mensajes
  const [showPassword, setShowPassword] = useState(false); // Estado para la visibilidad de la contraseña
  const navigate = useNavigate();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) => password.length >= 6;

  const handleValidations = async () => {
    const formErrors = {};
    const { email, password } = formData;

    if (!email) formErrors.email = "El correo electrónico es obligatorio.";
    else if (!isValidEmail(email)) formErrors.email = "Correo electrónico no válido.";

    if (!password) formErrors.password = "La contraseña es obligatoria.";
    else if (!isValidPassword(password)) formErrors.password = "La contraseña debe tener al menos 6 caracteres.";

    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      // Si no hay errores, hacer la petición de inicio de sesión
      try {
        const response = await fetch("http://localhost:8000/login/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
          credentials: "include", 
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setMessage({ type: "success", text: "Inicio de sesión exitoso." });
          setFormData({ email: "", password: "" });
          
          const getCsrfToken = async () => {
            const response = await fetch("http://localhost:8000/obtener_token/", {
                credentials: "include",
            });

            if (!response.ok) {
              setMessage({ type: "error", text: "No se pudo obtener el token CSRF." });
                return null;
            }

            const data = await response.json();
            return data.csrfToken;
        };

        const csrfToken = await getCsrfToken();
        if (!csrfToken) {
         alert("Error obteniendo el token CSRF");
         return;
     }

          localStorage.setItem("is_staff", data.is_staff ? "true" : "false", "token", data.csrfToken);

          if (data.is_staff) {
            // Redirige a la página de administrador
            navigate("/dash_rol");
          } else {
            // Redirige a la página de trabajador
            navigate("/dash_rol");
          }
        } else {
          setMessage({ type: "error", text: data.message || "Error al iniciar sesión." });
        }
      } catch (error) {
         setMessage({ type: error, text: "Error al realizar la solicitud. Intenta de nuevo." });
      }
    }
  };

  


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Eliminar el mensaje de error cuando el usuario comience a escribir
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev); // Alterna el estado de visibilidad de la contraseña
  };

  return (
    <>
      {/* Enlace de Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />
      <div className="form1 p-4 shadow-sm rounded mx-auto">
        {/* Logo y título */}
        <div className="text-center mb-3">
          <img
            src="imagenes/iconoFragaria.png"
            alt="Logo Fragaria"
            className="logo-fragaria"
          />
          <h1 className="mt-2 fragaria-text">Fragaria</h1>
        </div>

        {/* Mensaje de error o éxito */}
        {message && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`} role="alert">
            {message.text}
          </div>
        )}


        {/* Correo electrónico */}
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-control border-2 rounded-pill ${errors.email ? "is-invalid" : ""}`}
            autoComplete="email"
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        {/* Contraseña */}
        <div className="form-group position-relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleInputChange}
            className={`form-control border-2 rounded-pill ${errors.password ? "is-invalid" : ""}`}
            autoComplete="current-password"
          />
          {(formData.password || (formData.email && formData.password)) && (
            <button
              type="button"
              className="eye-icon-btn position-absolute top-50 translate-middle-y"
              onClick={togglePasswordVisibility}
            >
              <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          )}
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>

        {/* Botón de iniciar sesión */}
        <div className="form-group d-flex justify-content-between">
          <button className="btn btn-login rounded-pill" onClick={handleValidations}>
            Iniciar Sesión
          </button>
        </div>

        {/* Enlaces adicionales */}
        <div className="text-center mt-3">
          <Link to="/recuperar" className="link-recovery d-block mb-2">
            ¿Olvidaste tu contraseña?
          </Link>
          <Link to="/terminos" className="link-terms d-block mb-2">
            Términos y Condiciones
          </Link>
          <Link to="/registro" className="link-register d-block">
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </div>
    </>
  );
}

export default LoginForm;
