import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./footer.css"; // Importa el archivo CSS

function Footer() {
  return (
    <div className="d-flex flex-column">
      {/* Footer */}
      <footer className="text-center">
        <p className="footer-brand">
          &copy; 2025 Fragaria. Todos los derechos reservados.
        </p>
        <div className="social-icons my-3">
          <p className="footer-brand"> Fragaria: Tecnología y naturaleza al servicio de los agricultores.</p>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
