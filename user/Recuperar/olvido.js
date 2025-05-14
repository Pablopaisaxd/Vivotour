// Escribir y borrar por input

const inputs = document.querySelectorAll('.input-codigo');

inputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    const value = e.target.value;

    // Solo acepta dígitos
    if (!/^\d$/.test(value)) {
      e.target.value = '';
      return;
    }

    if (value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      if (input.value === '' && index > 0) {
        inputs[index - 1].focus();
        inputs[index - 1].value = '';
      }
    }
  });
});

// Ocultar contraseña
const togglePassword = document.querySelector('.toggle-password');
if (togglePassword) {
  togglePassword.addEventListener('click', () => {
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

const verificar = document.querySelector(".Recuperar-btn");
if(verificar){
verificar.addEventListener('click',()=>{
    window.location.href="verificar.html"
});
};

const NewPassword = document.querySelector(".btn-verificar");
if (NewPassword) {
  NewPassword.addEventListener("click", () => {
    window.location.href = "nuevaContraseña.html";
  });
};