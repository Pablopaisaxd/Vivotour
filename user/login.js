
        document.querySelector('.toggle-password').addEventListener('click', function() {
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


const registro = document.querySelector('.registro');
if(registro){
registro.addEventListener('click', ()=>{
    window.location.href='registro.html'
})
};

const forgotpassword = document.querySelector(".forgot-password");
if(forgotpassword){
    forgotpassword.addEventListener('click',()=>{
    window.location.href="/user/Recuperar/Recuperar.html";
});
};


// Logearse
const loginform=document.getElementById('form-login')

.addEventListener('submit', async (e) => {
  e.preventDefault();

  const datos = {
    correo: document.getElementById('emailLogin').value,
    contraseña: document.getElementById('passwordLogin').value
  };

  const res = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });

  const resultado = await res.json();

  if (res.ok) {
    alert('Inicio de sesión exitoso');
    window.location.href = 'dashboard.html'; // o cualquier otra página protegida
  } else {
    alert(resultado.mensaje);
  }
});