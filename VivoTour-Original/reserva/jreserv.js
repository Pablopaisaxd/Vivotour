        document.addEventListener('DOMContentLoaded', function() {
            // Selección del tipo de alojamiento
            const cabinCard = document.getElementById('cabin-card');
            const campingCard = document.getElementById('camping-card');
            const accommodationType = document.getElementById('accommodation-type');
            
            cabinCard.addEventListener('click', function() {
                cabinCard.classList.add('selected');
                campingCard.classList.remove('selected');
                accommodationType.value = 'cabin';
            });
            
            campingCard.addEventListener('click', function() {
                campingCard.classList.add('selected');
                cabinCard.classList.remove('selected');
                accommodationType.value = 'camping';
            });
        
            cabinCard.click();
            
            // opciones de actividades y servicios
            const allInclusiveCheckbox = document.getElementById('all-inclusive');
            const activityOptions = document.getElementById('activity-options');
            
            allInclusiveCheckbox.addEventListener('change', function() {
                if (!this.checked) {
                    activityOptions.style.display = 'block';
                } else {
                    activityOptions.style.display = 'none';
                    document.querySelectorAll('#activity-options input[type="checkbox"]').forEach(checkbox => {
                        checkbox.checked = false;
                    });
                }
            });
            
            // opnciones de comida
            const mealAllInclusive = document.getElementById('meal-all-inclusive');
            const individualMeals = document.getElementById('individual-meals');
            const mealOptions = document.querySelectorAll('.meal-option');
            
            mealAllInclusive.addEventListener('change', function() {
                if (this.checked) {
                    individualMeals.style.display = 'none';
                    mealOptions.forEach(option => {
                        option.classList.remove('selected');
                    });
                } else {
                    individualMeals.style.display = 'flex';
                }
            });
            
            mealOptions.forEach(option => {
                option.addEventListener('click', function() {
                    this.classList.toggle('selected');
                });
            });
            
            individualMeals.style.display = 'none';
            
            // Botón de reserva
            const bookNowBtn = document.getElementById('book-now');
            const bookingSummary = document.getElementById('booking-summary');
            const summaryContent = document.getElementById('summary-content');
            
            bookNowBtn.addEventListener('click', function() {
                // Chequeo de reserva
                const dateS = document.getElementById('reservation-date-start').value;
                const dateE = document.getElementById('reservation-date-end').value;
                const adults = document.getElementById('adults').value;
                const children = document.getElementById('children').value;
                const accommodation = accommodationType.value;
                const allInclusive = allInclusiveCheckbox.checked;
                const mealAllInclusiveChecked = mealAllInclusive.checked;
                
                // alertas
                if (!dateS) {
                    alert('seleccione una fecha de inicio de reserva');
                    return;
                }

                if (!dateE) {
                    alert('seleccione una fecha de fin de reserva');
                    return;
                }

                let activities = [];
                if (!allInclusive) {
                    document.querySelectorAll('#activity-options input[type="checkbox"]:checked').forEach(checkbox => {
                        activities.push(checkbox.nextElementSibling.textContent);
                    });
                }

                let meals = [];
                if (mealAllInclusiveChecked) {
                    meals.push('todas las comidas incluidas');
                } else {
                    document.querySelectorAll('.meal-option.selected').forEach(option => {
                        meals.push(option.textContent);
                    });
                    
                    if (meals.length === 0) {
                        alert('porfavor seleccione al menos una opción de comida');
                        return;
                    }
                }

                
                // Chequeo de reserva
                let summaryHTML = `
                    <p><strong>fecha inicio:</strong> ${new Date(dateS).toLocaleDateString()}</p>
                    <p><strong>fecha final:</strong> ${new Date(dateE).toLocaleDateString()}</p>
                    <p><strong>cantidad:</strong> ${adults} adulto(s), ${children} niños</p>
                    <p><strong>alojamiento:</strong> ${accommodation === 'cabin' ? 'cabañas' : 'Zona de camping'}</p>
                    <p><strong>Actividades y Servicios:</strong> ${allInclusive ? 'Todo incluido' : activities.join(', ') || 'Ninguno'}</p>
                    <p><strong>Opciones de comida:</strong> ${meals.join(', ')}</p>
                `;
                
                summaryContent.innerHTML = summaryHTML;
                bookingSummary.style.display = 'block';
                
                bookingSummary.scrollIntoView({ behavior: 'smooth' });
                
                // debug: removed console.log for production
            });
        });