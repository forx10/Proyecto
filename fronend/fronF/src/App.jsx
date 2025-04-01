import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./components/Dashboardprincipal/dashboard"; 
import FromSigul from "./components/Sign_in/fromSigul"; 
import FromLogin from "./components/Login/fromLogin.jsx"; 
import PasswordRecuper from "./components/Password/passwordRecovery.jsx"; 
import Actividades from"./components/Actividad/actvidades.jsx";
import Password from"./components/Password/password.jsx";
import AgregarTrabajador from "./components/Trabajadores/trabajar.jsx"
import Dash_rol from "./components/Dash_rol/dash_rol.jsx";
import Plantacion from "./components/Plantacion/platacion.jsx";
import Informes from"./components/informe/info.jsx";
import Perfil from "./components/Perfil/perfil.jsx";
import RegistroActividades from "./components/Registrar_actividad/registrar_actividad.jsx";
import ActividadesT from "./components/actvidadesTrabajador/actvidadesT.jsx";
import Perfiluser from "./components/Perfiluser/perfiluser.jsx";
import Calendario_admin from "./components/cronograma/cronogra.jsx";
import Calendario_trabajador from "./components/CronogramaTrabajador/cronograma.jsx";


function App() {
  
  return (
    <Router>
      <Routes>
        <Route
          path="/registro"
          element={
            <>
              
              <FromSigul />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <FromLogin />
            </>
          }
        />
        <Route
          path="/recuperar"
          element={
            <>
              <PasswordRecuper />
            </>
          }
        />
        <Route
          path="/password"
          element={
            <>
              <Password />
            </>
          }
        />
        <Route
          path="/perfiladmin"
          element={
            <>
              <Perfil/>
            </>
          }
        />
          <Route
          path="/perfiluser"
          element={
            <>
              <Perfiluser/>
            </>
          }
        />
        <Route
          path="/"
          element={
            <>
              < Dashboard/>
            </>
          }
        />
        <Route
          path="/dashprincipal"
          element={
            <>
              < Dashboard/>
            </>
          }
        />
        <Route
          path="/dash_rol"
          element={
            <>
              <Dash_rol/>
            </>
          }
        />
       
         <Route
          path="/trabajador"
          element={
            <>
              <AgregarTrabajador/>
            </>
          }
        />
        <Route
          path="/plantacion"
          element={
            <>
              <Plantacion/>
            </>
          }
        />
        <Route
          path="/informes"
          element={
            <>
              <Informes/>
            </>
          }
        />
        <Route
          path="/registraractividad"
          element={
            <>
              <RegistroActividades/>
            </>
          }
        />
         <Route
          path="/actividad_admin"
          element={
            <>
              <Actividades/>
            </>
          }
        />
          <Route
          path="/actividades_trabajador"
          element={
            <>
              <ActividadesT/>
            </>
          }
        />
         <Route
          path="/cronograma_admin"
          element={
            <>
              
              <Calendario_admin/>
            </>
          }
        />
        <Route
          path="/cronograma_trabajador"
          element={
            <>
              <Calendario_trabajador/>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
