import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApolo } from "../ApoloContext";
import axios from "axios";

function Navbaradmin() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const { greet, speak, greetListening } = useApolo();
  let lastScrollY = window.scrollY;

  useEffect(() => {
    greet();
  }, [greet]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "es-ES";

      recognitionRef.current.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (!lastResult.isFinal) return;
      
        const transcript = lastResult[0].transcript;
        setLastCommand(transcript);
        processVoiceCommand(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Error en reconocimiento de voz:", event.error);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchConteo = async (endpoint, errorMessage) => {
    try {
      const response = await axios.get(`http://localhost:8000/${endpoint}/`, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (response.data?.conteo !== undefined) {
        return response.data.conteo;
      }
      throw new Error("Formato de respuesta inválido");
    } catch (error) {
      console.error(`Error al obtener conteo de ${endpoint}:`, error);
      if (error.response?.status === 403) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }
      speak(errorMessage);
      return null;
    }
  };

  const obtenerConteoEmpleados = () =>
    fetchConteo("contar_empleados", "Hubo un error al consultar los empleados");
  
  const obtenerConteoInformes = () =>
    fetchConteo("contar_informes", "Hubo un error al consultar los informes");
  
  const obtenerConteoPlantaciones = () =>
    fetchConteo("contar_plantacion", "Hubo un error al consultar las plantaciones");

  const obtenerConteoActividadesEmpleado = async (nombre) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/contar_actividades_empleado/?nombre=${encodeURIComponent(nombre)}`, 
        {
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.data?.status === "success") {
        return response.data;
      }
      throw new Error(response.data?.message || "Formato de respuesta inválido");
    } catch (error) {
      console.error("Error al obtener conteo de actividades:", error);
      speak(`Hubo un error al consultar las actividades de ${nombre}`);
      return null;
    }
  };

  const descargarInformePDF = async () => {
    try {
      speak("Descargando informe en PDF...");
      const response = await axios.get("http://localhost:8000/descargar_informes_pdf/", {
        responseType: 'blob',
        withCredentials: true,
        headers: {
          Accept: "application/pdf",
        },
      });
  
      // Verificar si la respuesta es un PDF válido
      if (response.headers['content-type'] !== 'application/pdf') {
        const errorData = JSON.parse(await response.data.text());
        speak(errorData.error || "No se pudo generar el informe");
        return;
      }
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'informes_trabajadores.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      speak("Informe descargado con éxito");
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      if (error.response?.status === 400) {
        try {
          const errorData = JSON.parse(await error.response.data.text());
          speak(errorData.error || "No hay datos para el informe");
        } catch {
          speak("No se pudo generar el informe");
        }
      } else {
        speak("Hubo un error al descargar el informe PDF");
      }
    }
  };

  const navegarSiCoincide = (command, palabrasClave, ruta) => {
    if (palabrasClave.some((palabra) => command.includes(palabra))) {
      navigate(ruta);
      return true;
    }
    return false;
  };

  const consultarConteo = async (command, palabrasClave, fetchFunction, tipo) => {
    if (palabrasClave.some((palabra) => command.includes(palabra))) {
      speak(`Consultando el número de ${tipo}...`);
      const conteo = await fetchFunction();
      if (conteo !== null) {
        speak(conteo === 0 ? `Actualmente no tienes ${tipo} registrados.` : `Tienes ${conteo} ${tipo} registrados.`);
      } else {
        speak(`No pude obtener la información de los ${tipo}.`);
      }
      return true;
    }
    return false;
  };

  const processVoiceCommand = async (command) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const normalizedCommand = command.toLowerCase();
    console.log("Comando detectado:", normalizedCommand);

    if (!normalizedCommand.includes("apolo")) {
      setIsProcessing(false);
      return;
    }

    // Comando para descargar PDF
    if (normalizedCommand.includes("descarga el pdf") || normalizedCommand.includes("descargar el pdf") || normalizedCommand.includes("descarga informes")) {
      await descargarInformePDF();
      setTimeout(() => setIsProcessing(false), 2000);
      return;
    }

    const empleadoMatch = normalizedCommand.match(/apolo cuántas (?:tareas|actividades) tiene (\w+)/i) || 
                          normalizedCommand.match(/cuántas (?:tareas|actividades) tiene (\w+)/i) || 
                          normalizedCommand.match(/cuáles son las (?:tareas|actividades) de (\w+)/i);
    if (empleadoMatch) {
      const nombreEmpleado = empleadoMatch[1];
      if (nombreEmpleado) {
        speak(`Consultando las actividades de ${nombreEmpleado}...`);
        const resultado = await obtenerConteoActividadesEmpleado(nombreEmpleado);
        
        if (resultado) {
          const { empleado, conteo } = resultado;
          const mensaje = `${empleado} tiene ${conteo.total} actividades: ` +
            `${conteo.pendientes} pendientes, ` +
            `${conteo.completadas} completadas y ` +
            `${conteo.incompletas} incompletas.`;
          speak(mensaje);
        }
        setTimeout(() => setIsProcessing(false), 2000);
        return;
      }
    }

    if (
      navegarSiCoincide(normalizedCommand, ["perfil"], "/perfiladmin") ||
      navegarSiCoincide(normalizedCommand, ["ve a plantación", "ve plantaciones"], "/plantacion") ||
      navegarSiCoincide(normalizedCommand, ["ve a cronograma"], "/cronograma_admin") ||
      navegarSiCoincide(normalizedCommand, ["ve a trabajador", "a trabajadores"], "/trabajador") ||
      navegarSiCoincide(normalizedCommand, ["ve a informe", "a informes"], "/informes") ||
      navegarSiCoincide(normalizedCommand, ["ve actividad", "ve actividades", "ve a actividades"], "/actividad_admin")
    ) {
      setTimeout(() => setIsProcessing(false), 2000);
      return;
    }

    if (
      (await consultarConteo(
        normalizedCommand,
        ["cuántas plantaciones", "cuantas plantaciones", "número de plantaciones", "numero de plantaciones"],
        obtenerConteoPlantaciones,
        "plantaciones"
      )) ||
      (await consultarConteo(
        normalizedCommand,
        ["cuántos empleados", "cuantos empleados", "número de empleados", "numero de empleados", "cuántos trabajadores", "cuantos trabajadores"],
        obtenerConteoEmpleados,
        "empleados"
      )) ||
      (await consultarConteo(
        normalizedCommand,
        ["cuántos informes", "cuantos informes", "número de informes", "numero de informes"],
        obtenerConteoInformes,
        "informes"
      ))
    ) {
      setTimeout(() => setIsProcessing(false), 2000);
      return;
    }

    speak("No entendí el comando. Por favor intenta nuevamente.");
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      alert("El reconocimiento de voz no está disponible en tu navegador");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      speak("Dejé de escuchar");
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      greetListening();
    }
  };
  
  const styles = {
    navbar: {
      background: "linear-gradient(to right, #f4b183, #f8d8a8)",
      fontFamily: "'Montserrat', sans-serif",
      transition: "top 0.3s ease-in-out",
      position: "fixed",
      top: showNavbar ? "0" : "-80px",
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
    voiceButton: {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: 2000,
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      backgroundColor: isListening ? "#dc3545" : "#f4b183",
      border: "none",
      color: "white",
      fontSize: "24px",
      cursor: "pointer",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    commandDisplay: {
      position: "fixed",
      bottom: "90px",
      right: "20px",
      backgroundColor: "rgba(244, 177, 131, 0.9)",
      padding: "10px 15px",
      borderRadius: "20px",
      maxWidth: "300px",
      color: "white",
      fontSize: "14px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    }
  };

  return (
    <>
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
              <NavLink className="nav-link mx-2" to="/perfiladmin" style={styles.link}>
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
                to="/cronograma_admin"
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
              <NavLink className="nav-link mx-2" to="/trabajador" style={styles.link}>
                <img
                  src="imagenes/trabajador.png"
                  alt="Trabajadores"
                  width="30"
                  height="30"
                  className="me-1"
                />
                Trabajadores
              </NavLink>
              <NavLink className="nav-link mx-2" to="/informes" style={styles.link}>
                <img
                  src="imagenes/informe.png"
                  alt="Informes"
                  width="30"
                  height="30"
                  className="me-1"
                />
                Informes
              </NavLink>
              <NavLink className="nav-link mx-2" to="/actividad_admin" style={styles.link}>
                <img
                  src="imagenes/actividad.png"
                  alt="Actividad"
                  width="30"
                  height="30"
                  className="me-1"
                />
                Actividades
              </NavLink>
              <NavLink className="nav-link mx-2" to="/plantacion" style={styles.link}>
                <img
                  src="imagenes/siembra.png"
                  alt="Plantación"
                  width="30"
                  height="30"
                  className="me-1"
                />
                Plantación
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Botón de activación por voz */}
      <button 
        onClick={toggleVoiceRecognition}
        style={styles.voiceButton}
        title={isListening ? "Detener escucha" : "Activar comando de voz"}
      >
        {isListening ? (
          <i className="fas fa-microphone-slash"></i>
        ) : (
          <i className="fas fa-microphone"></i>
        )}
      </button>

      {/* Muestra el último comando detectado */}
      {isListening && lastCommand && (
        <div style={styles.commandDisplay}>
          <strong>Comando:</strong> {lastCommand}
        </div>
      )}
    </>
  );
}

export default Navbaradmin;