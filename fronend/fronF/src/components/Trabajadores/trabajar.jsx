import { useState, useEffect  } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbaradmin  from "../NavbarAdmin/Navadmin";
import Footer from "../Footer/footer";


const styles ={
  container: {
    minHeight: "100vh",
    minWidth: "100%", // <-- Aquí lo agregas
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(to bottom, rgb(252, 234, 208), rgb(255, 222, 199))",
  },
    btnCustom: {
    backgroundColor: "#d17c53",
    color: "#ffff",
    border: "2px solid rgb(255, 185, 153)",
    padding: "10px 10px",
    borderRadius: "25px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
    minWidth: "250px", // Aumenta el ancho mínimo del botón
    maxWidth: "300px", // Aumenta el ancho máximo
    marginTop: "100px",
  },
  card: {
    width: "90%",  // Por defecto, ocupará el 90% del ancho disponible
    maxWidth: "500px",  // Máximo de 900px en pantallas grandes
    minWidth: "250px",  // Mínimo de 250px en pantallas pequeñas
    margin: "30px auto", // Centrar la tarjeta horizontalmente
    background: "#ffff",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    border: "1px solid rgba(83, 83, 83, 0.2)",
    padding: "20px",
  },
  input: {
   
    fontFamily: "'Montserrat', sans-serif",
  },
  footerContainer: {
    textAlign: "center",
    width: "100%",
    marginTop: "auto",
  },
}


const AgregarTrabajador = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmation: "",
  });
 
  const [errors, setErrors] = useState({});
  const [trabajadores, setTrabajadores] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  

    // Fetch para obtener los trabajadores
    const fetchTrabajadores = async () => {
      try {
        const response = await fetch("http://localhost:8000/gestion_usuarios/", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          console.log(data);
          setTrabajadores(data.usuarios);
        } else {
          throw new Error(data.error || "Error al obtener los trabajadores");
        }
      } catch (error) {
        console.error("Error al obtener los trabajadores:", error);
        alert(error.message);
      }
    };


    useEffect(() => {
      fetchTrabajadores();
    }, []);


  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
 
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };


  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };


  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return () => clearTimeout(timer); // Limpiar el temporizador al desmontar
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};


    // Validaciones
    if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.apellido) newErrors.apellido = "El apellido es obligatorio";
    if (!formData.email) newErrors.email = "El correo es obligatorio";
    if (!validateEmail(formData.email)) newErrors.email = "El correo no es válido";
  

    // Si estamos editando, no se validan las contraseñas
    if (editIndex === null) {
        if (!formData.password) newErrors.password = "La contraseña es obligatoria";
        if (formData.password !== formData.confirmation) {
            newErrors.confirmation = "Las contraseñas no coinciden";
        }
    }


    setErrors(newErrors);

    // Si no hay errores, actualizamos o añadimos el trabajador
    if (Object.keys(newErrors).length === 0) {
      if (editIndex !== null) {
        // EDITAR USUARIO EXISTENTE
        try {
            const response = await fetch(`http://localhost:8000/editar-usuario/${trabajadores[editIndex].id}/`, {
                method: "PUT",  
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: formData.nombre,
                    last_name: formData.apellido,
                    email: formData.email,
                
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al actualizar el trabajador");
            }
            // Actualizar la lista de trabajadores con los datos editados
            const updatedTrabajadores = [...trabajadores];
            updatedTrabajadores[editIndex] = data;
            setTrabajadores(updatedTrabajadores);
            //setTrabajadores([...trabajadores, data]);
            fetchTrabajadores();
            setMessage({ type: "success", text: "Trabajador actualizado con éxito" });
           

        } catch (error) {
            console.error("Error al actualizar:", error);
            setMessage(error.message);
            
        }
    } else {
        // AÑADIR NUEVO USUARIO
        try {
            const response = await fetch("http://localhost:8000/api/agregar-usuario/", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: formData.nombre,
                    last_name: formData.apellido,
                    email: formData.email,
                    password1: formData.password,
                    password2: formData.confirmation,
                }),
            });

            const data = await response.json();
           
            if (!response.ok) {
                throw new Error(data.error || "Error al agregar el trabajador");
            }
            
            setTrabajadores([...trabajadores, data]);
            fetchTrabajadores(); 
            setMessage({ type: "success", text: "Trabajador registrado con éxito" });

            // **Esperar a que el mensaje se muestre antes de limpiar**
            setTimeout(() => {
              setFormData({ nombre: "", apellido: "", email: "", password: "", confirmation: "" });
              setIsFormVisible(false);
              setEditIndex(null);
          }, 500);
          
        } catch (error) {
            console.error("Error:", error);
            setMessage({ type: "danger", text: error.message });
        }
        
    } 
  
    // Limpiar formulario y cerrar modal
    setIsFormVisible(false);
    setFormData({ nombre: "", apellido: "", email: "", password: "", confirmation: "" });
    setEditIndex(null);

  };
  
}
  const handleEdit = (index) => {
    setFormData({
      nombre: trabajadores[index].first_name,  // Asegúrate de usar las claves correctas del objeto
      apellido: trabajadores[index].last_name,
      email: trabajadores[index].email,

    });
    setEditIndex(index);  // Establecemos el índice del trabajador que estamos editando
    setIsFormVisible(true);  // Mostramos el formulario
};
    const handleDelete = async (index) => {
      const userId = trabajadores[index].id;  // Usar el índice para obtener el ID del trabajador
      console.log("User ID:", userId);

      try {
        const response = await fetch(`http://localhost:8000/eliminar-usuario/${userId}/`, {
          method: 'DELETE',  // Método de eliminación, ya que el backend lo espera
          credentials: "include",  // Asegúrate de enviar las cookies de sesión si es necesario
          headers: { "Content-Type": "application/json" },  // Asegúrate de enviar la cabecera correcta
        });

        const data = await response.json();  // Obtener los datos de la respuesta

        if (response.ok) {
          // Si la respuesta es exitosa, elimina al trabajador del estado
          setTrabajadores(trabajadores.filter((_, i) => i !== index));
          setMessage({ type: "success", text: "Trabajador eliminado correctamente" });
        } else {
          throw new Error(data.message || "Error al eliminar el trabajador");
        }
      } catch (error) {
        console.error("Error al eliminar el trabajador:", error);
        setMessage({ type: "danger", text: error.message });
      }
   
  };
 
  const [showPasswords, setShowPasswords] = useState({ password: false, confirmation: false });
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };


  return (
    <div style={styles.container}>
        <link
              rel="stylesheet"
              href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
            />

      <div className="d-flex justify-content-center align-items-center" >
          <Navbaradmin/>
        <div className="d-flex justify-content-center">
          <button
            onClick={() => {
              setIsFormVisible(!isFormVisible);
              setEditIndex(null);
              setFormData({ nombre: "", apellido: "", email: "", password: "", confirmation: "" });
            }}
            className="d-flex justify-content-center mb-2" style={styles.btnCustom}
          >
            {isFormVisible ? "Cancelar" : "Agregar trabajador"}
          </button>
        </div>
            
      {message.text && (
        <div className={`alert alert-${message.type} text-center`} role="alert">
          {message.text}
        </div>
      )}


        {isFormVisible && (
          <div className="shadow-lg p-4 rounded-lg justify-content-center " style={styles.card}>
            <h3 className="mb-4 text-center text-gradient" style={{color: "#4b2215"}}>
              {editIndex !== null ? "Editar Trabajador" : "Registrar Trabajador"}
            </h3>
            <form onSubmit={handleSubmit}>
              {["nombre", "apellido"].map((field) => (
                <div key={field} className="mb-4">
                  <input
                    type="text"
                    style={styles.input}
                    className="form-control"
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)} // Asegúrate de que el cambio se maneje
                  />
                </div>
              ))}


              <div className="mb-4">
                <input
                  type="email"
                  style={styles.input}
                  className={`form-control  ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>


              {["password", "confirmation"].map((field) => (
                <div key={field} className="mb-4 position-relative">
                  <input
                    style={styles.input}
                    type={showPasswords[field] ? "text" : "password"}
                    className={`form-control  ${errors[field] ? "is-invalid" : ""}`}
                    placeholder={field === "confirmation" ? "Confirmar contraseña" : "Contraseña"}
                    value={formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    disabled={editIndex !== null} 
                  />
                  {/* Mostrar el icono solo si hay texto en el campo y no hay error */}
                  {formData[field] && !errors[field] && (
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
              
              <button type="submit" className="btn btn-gradient w-100 mt-3 py-2 fw-bold btn-sm"
                      style={{
                      color: "#ffff",
                      fontFamily: "'Montserrat', sans-serif",
                      backgroundColor: "#d17c53",
                      borderRadius: "10px",
                      border: "2px solid rgb(255, 185, 153)", }}>
                {editIndex !== null ? "Actualizar" : "Registrar"}
              </button>
            </form>
          </div>
        )}
        
          <div className="container mt-3 mb-5"> {/* Contenedor para evitar que las tarjetas queden pegadas a los márgenes */}
            <h3 className="mb-4 text-center text-gradient" style={{ color: "#4b2215", marginTop: "10px"}}>
              Trabajadores Registrados
            </h3>
            {trabajadores.length > 0 ? (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 "> {/* Separación entre tarjetas */}
                {trabajadores.map((trabajador, index) => (
                  <div key={index} className="col">
                    <div className="card shadow-lg h-100 rounded-lg p-3 " style={{ backgroundColor: "#f5f5f5",minWidth:"200px"}}>
                      <div className="card-body">
                        <h5 className="card-title text-center" style={{color: "#4b2215"}}>
                            {trabajador.first_name} {trabajador.last_name}
                        </h5>
                        <p className="card-text text-muted text-center">{trabajador.email}</p>
                        <div className="d-flex justify-content-center gap-2"> {/* Espacio entre botones */}
                          <button onClick={() => handleEdit(index)} className="btn fw-bold "
                            style={{backgroundColor: "#fad885",
                                    fontFamily: "'Montserrat', sans-serif",}}>
                            Editar
                          </button>
                          <button onClick={() => handleDelete(index, trabajador.id)} className="btn fw-bold "
                            style={{backgroundColor:"#c65b4a",
                                    fontFamily: "'Montserrat', sans-serif",}}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center " style={{ color: "#4b2215"}}>No hay trabajadores registrados.</p>
            )}
          </div>
      </div>
      <div style={styles.footerContainer}>
          <Footer/>
      </div>
    </div>
  );
};


export default AgregarTrabajador;



