$(document).ready(function() {
    const sessionTimes = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
    const maxBookingDays = 7;
    const archiveDays = 7;
    const seatsPerSession = 30;
    const dateInput = $('#date');
    const sessionsDiv = $('#sessions');
    const reserveButton = $('#reserveButton');
    const confirmationModal = $('#confirmationModal');
    const closeModal = $('.close');

    let selectedSeats = [];

    dateInput.attr('min', getFormattedDate(-archiveDays));
    dateInput.attr('max', getFormattedDate(maxBookingDays));
    dateInput.val(getFormattedDate(0));

    dateInput.change(loadSessions);
    reserveButton.click(reserveSeats);
    closeModal.click(() => confirmationModal.hide());
    $(window).click(event => {
        if (event.target == confirmationModal[0]) {
            confirmationModal.hide();
        }
    });

    loadSessions();

    function getFormattedDate(offset) {
        const date = new Date();
        date.setDate(date.getDate() + offset);
        return date.toISOString().split('T')[0];
    }

    function loadSessions() {
        const selectedDate = new Date(dateInput.val());
        const today = new Date();
        const isArchived = selectedDate < today.setDate(today.getDate() - archiveDays);

        sessionsDiv.empty();
        selectedSeats = [];
        reserveButton.prop('disabled', true);

        sessionTimes.forEach(time => {
            const sessionDiv = $('<div class="session"></div>');
            const sessionLabel = $('<div></div>').text(`Сеанс ${time}`);
            sessionDiv.append(sessionLabel);

            for (let i = 0; i < seatsPerSession; i++) {
                const seat = $('<div class="seat available"></div>');
                seat.text(i + 1);

                const seatStatus = getSeatStatus(selectedDate, time, i + 1);
                seat.addClass(seatStatus);

                if (!isArchived && seatStatus === 'available') {
                    seat.click(() => toggleSelection(selectedDate, time, i + 1, seat));
                }

                sessionDiv.append(seat);
            }

            sessionsDiv.append(sessionDiv);
        });
    }

    function getSeatStatus(date, time, seatNumber) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '{}');
        const dateStr = date.toISOString().split('T')[0];
        const key = `${dateStr}-${time}-${seatNumber}`;

        if (bookings[key]) {
            return 'booked';
        }

        const now = new Date();
        if (date < now || (date.toDateString() === now.toDateString() && parseInt(time.split(':')[0]) <= now.getHours())) {
            return 'archived';
        }

        return 'available';
    }

    function toggleSelection(date, time, seatNumber, seatElement) {
        const dateStr = date.toISOString().split('T')[0];
        const key = `${dateStr}-${time}-${seatNumber}`;

        if (selectedSeats.includes(key)) {
            selectedSeats = selectedSeats.filter(item => item !== key);
            seatElement.removeClass('selected').addClass('available');
        } else {
            selectedSeats.push(key);
            seatElement.removeClass('available').addClass('selected');
        }

        reserveButton.prop('disabled', selectedSeats.length === 0);
    }

    function reserveSeats() {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '{}');

        selectedSeats.forEach(key => {
            bookings[key] = true;
            $(`.seat.selected[data-key="${key}"]`).removeClass('selected').addClass('booked').off('click');
        });

        localStorage.setItem('bookings', JSON.stringify(bookings));
        selectedSeats = [];
        reserveButton.prop('disabled', true);
        
        confirmationModal.show();
    }

    $(document).on('DOMNodeInserted', function(e) {
        if ($(e.target).hasClass('seat')) {
            const seat = $(e.target);
            const dateStr = dateInput.val();
            const time = seat.closest('.session').find('div:first').text().split(' ')[1];
            const seatNumber = seat.text();
            const key = `${dateStr}-${time}-${seatNumber}`;
            seat.attr('data-key', key);
        }
    });
});
