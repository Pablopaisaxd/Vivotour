
// colocar los prefijos 
const input = document.querySelector(".Telefono");
window.intlTelInput(input, {
    initialCountry: "co", // Colombia por defecto
    preferredCountries: ["co", "us", "mx"],
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
});

// Usar Choisejs

  const tipoDoc = document.querySelector('.tipo');
  const choices = new Choices(tipoDoc, {
    searchEnabled: false,     
    shouldSort: false,         
    itemSelectText: '',        
  });


// Ocultar la contraseña
const ocultar= document.querySelector('.toggle-password');
if(ocultar){
ocultar.addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const eyeOpen = document.querySelectorAll('.eye-open');
    const eyeClosed = document.querySelectorAll('.eye-closed');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeOpen.forEach(el => el.style.display = 'none');
        eyeClosed.forEach(el => el.style.display = 'block');
    } else {
        passwordInput.type = 'password';
        eyeOpen.forEach(el => el.style.display = 'block');
        eyeClosed.forEach(el => el.style.display = 'none');
    }
});
}

// llevar al login
const sesion = document.querySelector(".sesion");
sesion.addEventListener("click", () => {
    window.location.href = "login.html"
});


// Insertar datos en Registro
document.getElementById('form-registro').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const datos = Object.fromEntries(formData.entries());

  // Validaciones
  if (datos.Contraseña !== datos.ConfirmarContraseña) {
    alert("Las contraseñas no coinciden");
    return;
  }

  if (datos.Contraseña.length < 12) {
    alert("La contraseña debe tener al menos 12 caracteres");
    return;
  }

  // Enviar al servidor
  const respuesta = await fetch("http://localhost:3000/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
    Nombre: datos.Nombre,
    Email: datos.Email,
    Contraseña: datos.Contraseña,
    Celular: datos.Celular,
    NumeroDocumento:datos.documento,
    TipoDocumento:datos.tipo
    })
  });

  const resJson = await respuesta.json();
if(respuesta.ok){
  window.location.href='login.html'
}
});

