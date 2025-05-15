
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
document.querySelector('.toggle-password').addEventListener('click', function () {
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


// llevar al login
const sesion = document.querySelector(".sesion");
sesion.addEventListener("click", () => {
    window.location.href = "login.html"
});
