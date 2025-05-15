
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
