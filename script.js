$(document).ready(function() {
    const sessionTimes = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
    const maxBookingDays = 7;
    const archiveDays = 7;
    const seatsPerSession = 30;
    const dateInput = $('#date');
    const sessionsDiv = $('#sessions');

    dateInput.attr('min', getFormattedDate(-archiveDays));
    dateInput.attr('max', getFormattedDate(maxBookingDays));
    dateInput.val(getFormattedDate(0));

    dateInput.change(loadSessions);
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

        sessionTimes.forEach(time => {
            const sessionDiv = $('<div class="session"></div>');
            const sessionLabel = $('<div></div>').text(`Сеанс ${time}`);
            sessionDiv.append(sessionLabel);

            for (let i = 0; i < seatsPerSession; i++) {
                const seat = $('<div class="seat"></div>');
                seat.text(i + 1);

                const seatStatus = getSeatStatus(selectedDate, time, i + 1);
                seat.addClass(seatStatus);

                if (!isArchived && seatStatus === 'available') {
                    seat.click(() => toggleBooking(selectedDate, time, i + 1, seat));
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

    function toggleBooking(date, time, seatNumber, seatElement) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '{}');
        const dateStr = date.toISOString().split('T')[0];
        const key = `${dateStr}-${time}-${seatNumber}`;

        if (bookings[key]) {
            delete bookings[key];
            seatElement.removeClass('booked').addClass('available');
        } else {
            bookings[key] = true;
            seatElement.removeClass('available').addClass('booked');
        }

        localStorage.setItem('bookings', JSON.stringify(bookings));
    }
});
