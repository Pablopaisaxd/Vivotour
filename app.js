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
