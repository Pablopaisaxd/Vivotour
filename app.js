// apartado del boton de modo oscuro -----------------------



let modo=document.getElementById("modo");
let body=document.body;

modo.addEventListener("click", function(){
    let val=body.classList.toggle("dark")
    localStorage.setItem("modo",val)
})

let valor=localStorage.getItem("modo")

if (valor=="true") {
    body.classList.add("dark")
    modo.innerHTML='<i class="fa-solid fa-sun"></i>';
    modo.style.color="whitesmoke"
} else {
    body.classList.remove("dark")
        modo.innerHTML='<i class="fa-solid fa-moon"></i>';
    modo.style.color="black"
}

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