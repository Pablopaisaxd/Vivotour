import "./style/Mapa.css";

const Mapa = () => {
  return (
    <div className="contmap">
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d126991.79048466755!2d-75.15647527476965!3d5.926494261696179!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e46b923f976857b%3A0x6b67113b937a0097!2sPuente%20amarillo%20reservas!5e0!3m2!1ses-419!2sco!4v1746585523357!5m2!1ses-419!2sco"
      width="1200"
      height="600"
      style={{ border: 'solid #06141d48', marginBottom: '4rem', borderRadius: '1rem', boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.534)' }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
    </div>
  );
};

export default Mapa;
