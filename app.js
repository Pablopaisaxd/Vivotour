// apartado del boton de modo oscuro -----------------------



let modo = document.getElementById("modo");
let body = document.body;

modo.addEventListener("click", function () {
    let val = body.classList.toggle("dark");
    localStorage.setItem("modo", val);

    if (val) {
        modo.innerHTML = '<i class="fa-solid fa-sun"></i>';
        modo.style.color = "whitesmoke";
    } else {
        modo.innerHTML = '<i class="fa-solid fa-moon"></i>';
        modo.style.color = "black";
    }
});


// apartado del intro (header) -----------------------


document.addEventListener("DOMContentLoaded", function () {
    const textos = document.querySelectorAll(".pint");
    let index = 0;

    function cambiarTexto() {
        textos.forEach((p) => {
            p.style.opacity = "0";
            p.style.visibility = "hidden";
            p.style.position = "absolute";
        });

        textos[index].style.opacity = "1";
        textos[index].style.visibility = "visible";
        textos[index].style.position = "static";

        index = (index + 1) % textos.length;
    }

    setInterval(cambiarTexto, 10000);
});


// apartado del header -----------------------



let sections = document.querySelectorAll('section');
let navLinks = document.getElementById('navaccess navbar btnnav ');
window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');
        if(top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });
};

// interactividad navbar -----------------


function stickyNav() {
  let triggerSection = document.querySelector("#quesomos");
  let nav = document.querySelector("#navaccess");

  if (!triggerSection || !nav) return;

  let triggerPoint = triggerSection.offsetTop - 100; 
  let scrollValue = window.scrollY;

  if (scrollValue > triggerPoint) {
    nav.classList.add("header-sticky");
  } else {
    nav.classList.remove("header-sticky");
  }
}

window.addEventListener("scroll", stickyNav);

document.querySelector(".btnlog").addEventListener("click", function() {
    window.location.href = "./user/login.html";
});

document.getElementById("btnres").addEventListener("click", function() {
    window.location.href = "./reserva/hreserv.html";
});


document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll(".imgprin img");
    let index = 0;

    function changeImage() {
        images.forEach(img => img.classList.add("imgprinactive")); // Oculta todas
        images[index].classList.remove("imgprinactive"); // Muestra la actual
        index = (index + 1) % images.length; // Ciclo infinito
    }

    changeImage(); // Mostrar la primera imagen
    setInterval(changeImage, 10000); // Cambia cada 10 segundos
});



document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll(".opimg img");
    let index = 0;

    function changeImage() {
        images.forEach(img => img.classList.add("opimgactive")); // Oculta todas
        images[index].classList.remove("opimgactive"); // Muestra la actual
        index = (index + 1) % images.length; // Ciclo infinito
    }

    changeImage(); // Mostrar la primera imagen
    setInterval(changeImage, 10000); // Cambia cada 10 segundos
});
