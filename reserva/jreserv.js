class Calendar {
    constructor(id) {
        this.cells = [];
        this.selectedDates = [];
        this.currentMonth = moment();
        this.elCalendar = document.getElementById(id);
        this.showTemplate();
        this.elGridBody = this.elCalendar.querySelector('.grid__body');
        this.elMonthName = this.elCalendar.querySelector('.month-name');
        this.showCells();
    }

    showTemplate() {
        this.elCalendar.innerHTML = `
            <div class="calendar__header">
                <span class="month-name"></span>
            </div>
            <div class="calendar__body">
                <div class="grid">
                    <div class="grid__header">
                        <span class="grid__cell grid__cell--gh">Lun</span>
                        <span class="grid__cell grid__cell--gh">Mar</span>
                        <span class="grid__cell grid__cell--gh">Mié</span>
                        <span class="grid__cell grid__cell--gh">Jue</span>
                        <span class="grid__cell grid__cell--gh">Vie</span>
                        <span class="grid__cell grid__cell--gh">Sáb</span>
                        <span class="grid__cell grid__cell--gh">Dom</span>
                    </div>
                    <div class="grid__body"></div>
                </div>
            </div>
        `;
    }

    showCells() {
        this.cells = this.generateDates(this.currentMonth);
        const today = moment().startOf('day');
        this.elGridBody.innerHTML = '';

        let template = '';
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            const cellDate = cell.date.clone().startOf('day');
            let classes = 'grid__cell grid__cell--gd';

            if (!cell.isInCurrentMonth || cellDate.isBefore(today)) {
                classes += ' grid__cell--disabled';
            }

            if (this.selectedDates.some(d => d.isSame(cellDate, 'day'))) {
                classes += ' grid__cell--selected';
            }

            template += `<span class="${classes}" data-cell-id="${i}">${cell.date.date()}</span>`;
        }

        this.elMonthName.textContent = this.currentMonth.format('MMM YYYY');
        this.elGridBody.innerHTML = template;
        this.addEventListenerToCells();
    }

    generateDates(month) {
        let start = moment(month).startOf('month');
        let end = moment(month).endOf('month');
        const cells = [];

        while (start.day() !== 1) start.subtract(1, 'day');
        while (end.day() !== 0) end.add(1, 'day');

        do {
            cells.push({
                date: moment(start),
                isInCurrentMonth: start.month() === month.month()
            });
            start.add(1, 'day');
        } while (start.isSameOrBefore(end));

        return cells;
    }

    addEventListenerToCells() {
        const elCells = this.elCalendar.querySelectorAll('.grid__cell--gd');
        elCells.forEach(elCell => {
            elCell.addEventListener('click', e => {
                const el = e.target;
                const cellIndex = parseInt(el.dataset.cellId);
                const clickedDate = this.cells[cellIndex].date;

                if (el.classList.contains('grid__cell--disabled')) return;

                const isSelected = el.classList.contains('grid__cell--selected');

                if (isSelected) {
                    el.classList.remove('grid__cell--selected');
                    this.selectedDates = this.selectedDates.filter(d =>
                        !d.isSame(clickedDate, 'day')
                    );
                } else {
                    el.classList.add('grid__cell--selected');
                    this.selectedDates.push(clickedDate);
                }

                this.elCalendar.dispatchEvent(new Event('change'));
            });
        });
    }

    getElement() {
        return this.elCalendar;
    }

    value() {
        return this.selectedDates;
    }
}



const input = document.getElementById('cantidad-personas');
const btnSumar = document.getElementById('sumar');
const btnRestar = document.getElementById('restar');

btnSumar.addEventListener('click', () => {
    input.value = parseInt(input.value) + 1;
});

btnRestar.addEventListener('click', () => {
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
});


const chkTodos = document.getElementById('todos-servicios');
const serviciosDiv = document.getElementById('servicios-individuales');

chkTodos.addEventListener('change', () => {
    if (chkTodos.checked) {
        serviciosDiv.classList.add('oculto');
    } else {
        serviciosDiv.classList.remove('oculto');
    }
});



document.querySelectorAll('.input-hospedaje').forEach(div => {
    const input = div.querySelector('.cantidad');
    const btnSumar = div.querySelector('.sumar');
    const btnRestar = div.querySelector('.restar');

    btnSumar.addEventListener('click', () => {
        input.value = parseInt(input.value) + 1;
    });

    btnRestar.addEventListener('click', () => {
        if (parseInt(input.value) > 0) {
            input.value = parseInt(input.value) - 1;
        }
    });
});
