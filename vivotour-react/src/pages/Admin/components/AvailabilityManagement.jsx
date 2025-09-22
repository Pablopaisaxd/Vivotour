import React, { useState } from 'react';

const AvailabilityManagement = () => {
    const [selectedDates, setSelectedDates] = useState([]);
    const [newDate, setNewDate] = useState('');
    const [accommodationAvailability, setAccommodationAvailability] = useState({
        cabin: true,
        camping: true
    });
    const [activitiesAvailability, setActivitiesAvailability] = useState({
        'Caminata a la cascada': true,
        'Caminata Puente Amarillo': true,
        'Avistamiento de aves': true,
        'Zona de motocross': true,
        'Día de sol': true,
        'Charco': true,
        'Cabalgatas': true
    });
    const [mealsAvailability, setMealsAvailability] = useState({
        'Desayuno': true,
        'Almuerzo': true,
        'Cena': true
    });

    const ACTIVITIES = [
        { name: 'Caminata a la cascada', tooltip: 'Disfruta de una hermosa caminata junto a la cascada.' },
        { name: 'Caminata Puente Amarillo', tooltip: 'Explora el Puente Amarillo con vistas espectaculares.' },
        { name: 'Avistamiento de aves', tooltip: 'Observa aves exóticas en su hábitat natural.' },
        { name: 'Zona de motocross', tooltip: 'Zona para los amantes del motocross y la aventura.' },
        { name: 'Día de sol', tooltip: 'Relájate y disfruta del sol en áreas designadas.' },
        { name: 'Charco', tooltip: 'Zona natural para refrescarse y divertirse.' },
        { name: 'Cabalgatas', tooltip: 'Paseos a caballo por senderos naturales.' }
    ];

    const MEALS = ['Desayuno', 'Almuerzo', 'Cena'];

    const addDate = () => {
        if (newDate && !selectedDates.includes(newDate)) {
            setSelectedDates([...selectedDates, newDate]);
            setNewDate('');
        }
    };

    const removeDate = (dateToRemove) => {
        setSelectedDates(selectedDates.filter(date => date !== dateToRemove));
    };

    const handleToggleAccommodation = (type) => {
        setAccommodationAvailability(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const handleToggleActivity = (activityName) => {
        setActivitiesAvailability(prev => ({
            ...prev,
            [activityName]: !prev[activityName]
        }));
    };

    const handleToggleMeal = (mealName) => {
        setMealsAvailability(prev => ({
            ...prev,
            [mealName]: !prev[mealName]
        }));
    };

    const styles = {
        container: {
            padding: '20px',
            backgroundColor: 'var(--card-background)',
            borderRadius: '8px',
            boxShadow: '0 5px 15px var(--shadow-light)',
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
        },
        title: {
            fontSize: '1.5rem',
            color: 'var(--rich-black)',
            marginBottom: '15px',
            fontWeight: '600',
        },
        section: {
            marginBottom: '20px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '8px',
            padding: '15px',
        },
        subtitle: {
            fontSize: '1.2rem',
            color: 'var(--rich-black)',
            marginBottom: '10px',
            fontWeight: '500',
        },
        dateInputContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
        },
        dateInput: {
            padding: '8px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '5px',
            color: 'var(--rich-black)',
        },
        addButton: {
            backgroundColor: 'var(--forest-green)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
        },
        selectedDatesList: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            marginTop: '10px',
        },
        selectedDateItem: {
            backgroundColor: 'var(--error-main)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
        },
        removeButton: {
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
        },
        availabilityGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
        },
        availabilityItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px',
            border: '1px solid var(--border-color-light)',
            borderRadius: '8px',
            backgroundColor: 'var(--alice-blue)',
            color: 'var(--rich-black)',
        },
        toggleButton: {
            marginLeft: '10px',
            padding: '5px 10px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
        },
        availableButton: {
            backgroundColor: 'var(--forest-green)',
            color: 'white',
        },
        unavailableButton: {
            backgroundColor: 'var(--error-main)',
            color: 'white',
        },
        saveButton: {
            backgroundColor: 'var(--forest-green)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '10px',
            alignSelf: 'flex-end',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Modificar Disponibilidad</h2>

            <div style={styles.section}>
                <h3 style={styles.subtitle}>Fechas</h3>
                <div style={styles.dateInputContainer}>
                    <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        style={styles.dateInput}
                    />
                    <button onClick={addDate} style={styles.addButton}>Agregar Fecha</button>
                </div>
                <div style={styles.selectedDatesList}>
                    {selectedDates.map(date => (
                        <div key={date} style={styles.selectedDateItem}>
                            {new Date(date).toLocaleDateString()}
                            <button onClick={() => removeDate(date)} style={styles.removeButton}>×</button>
                        </div>
                    ))}
                </div>
                <p style={{ color: 'var(--rich-black)', textAlign: 'center', marginTop: '10px' }}>
                    Fechas seleccionadas para deshabilitar: {selectedDates.map(d => new Date(d).toLocaleDateString()).join(', ')}
                </p>
            </div>

            <div style={styles.section}>
                <h3 style={styles.subtitle}>Alojamiento</h3>
                <div style={styles.availabilityGrid}>
                    <div style={styles.availabilityItem}>
                        Cabañas
                        <button
                            style={{
                                ...styles.toggleButton,
                                ...(accommodationAvailability.cabin ? styles.availableButton : styles.unavailableButton)
                            }}
                            onClick={() => handleToggleAccommodation('cabin')}
                        >
                            {accommodationAvailability.cabin ? '✔ Disponible' : '✖ No Disponible'}
                        </button>
                    </div>
                    <div style={styles.availabilityItem}>
                        Zona de Camping
                        <button
                            style={{
                                ...styles.toggleButton,
                                ...(accommodationAvailability.camping ? styles.availableButton : styles.unavailableButton)
                            }}
                            onClick={() => handleToggleAccommodation('camping')}
                        >
                            {accommodationAvailability.camping ? '✔ Disponible' : '✖ No Disponible'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.subtitle}>Actividades y Servicios</h3>
                <div style={styles.availabilityGrid}>
                    {ACTIVITIES.map(activity => (
                        <div key={activity.name} style={styles.availabilityItem}>
                            {activity.name}
                            <button
                                style={{
                                    ...styles.toggleButton,
                                    ...(activitiesAvailability[activity.name] ? styles.availableButton : styles.unavailableButton)
                                }}
                                onClick={() => handleToggleActivity(activity.name)}
                            >
                                {activitiesAvailability[activity.name] ? '✔ Disponible' : '✖ No Disponible'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.subtitle}>Opciones de Comida</h3>
                <div style={styles.availabilityGrid}>
                    {MEALS.map(meal => (
                        <div key={meal} style={styles.availabilityItem}>
                            {meal}
                            <button
                                style={{
                                    ...styles.toggleButton,
                                    ...(mealsAvailability[meal] ? styles.availableButton : styles.unavailableButton)
                                }}
                                onClick={() => handleToggleMeal(meal)}
                            >
                                {mealsAvailability[meal] ? '✔ Disponible' : '✖ No Disponible'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button style={styles.saveButton}>Guardar Cambios</button>
        </div>
    );
};

export default AvailabilityManagement;