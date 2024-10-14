// Your code here
document.addEventListener("DOMContentLoaded", () => {
    const filmList = document.getElementById("films");
    const poster = document.getElementById("poster");
    const title = document.getElementById("title");
    const runtime = document.getElementById("runtime");
    const showtime = document.getElementById("showtime");
    const filmInfo = document.getElementById("film-info");
    const ticketNum = document.getElementById("ticket-num");
    const buyTicketButton = document.getElementById("buy-ticket");
    let currentFilmId = 1;
    // Fetch and display the first film's details on page load
    fetchFilmDetails(1);
    // Fetch list of all films and populate the film menu
    fetchFilms();
    // buying tickets
    buyTicketButton.addEventListener("click", () => {
        buyTicket(currentFilmId);
    });
    // Fetch the details of a specific film by ID and update the UI
    function fetchFilmDetails(filmId) {
        fetch(`http://localhost:3000/films/${filmId}`)
            .then(response => response.json())
            .then(film => {
                updateFilmDetails(film);
                currentFilmId = film.id;
            });
    }
    // GET list of all films and populate the film menu
    function fetchFilms() {
        fetch("http://localhost:3000/films")
            .then(response => response.json())
            .then(films => {
                films.forEach(film => {
                    const filmItem = document.createElement("li");
                    filmItem.className = "film item";
                    filmItem.textContent = film.title;
                    filmItem.addEventListener("click", () => {
                        fetchFilmDetails(film.id);
                    });
                    // Add delete button next to each film
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.classList.add("delete-button");
                    deleteButton.addEventListener("click", (e) => {
                        e.stopPropagation();
                        deleteFilm(film.id, filmItem);
                    });
                    filmItem.appendChild(deleteButton);
                    filmList.appendChild(filmItem);
                });
            });
    }
    function updateFilmDetails(film) {
        poster.src = film.poster;
        title.textContent = film.title;
        runtime.textContent = `${film.runtime} minutes`;
        showtime.textContent = film.showtime;
        filmInfo.textContent = film.description;
        const availableTickets = film.capacity - film.tickets_sold;
        ticketNum.textContent = `${availableTickets} remaining tickets`;
        if (availableTickets === 0) {
            buyTicketButton.textContent = "Sold Out";
            buyTicketButton.disabled = true;
        } else {
            buyTicketButton.textContent = "Buy Ticket";
            buyTicketButton.disabled = false;
        }
    }
    // buy a ticket and update server
    function buyTicket(filmId) {
        fetch(`http://localhost:3000/films/${filmId}`)
            .then(response => response.json())
            .then(film => {
                const availableTickets = film.capacity - film.tickets_sold;
                if (availableTickets > 0) {
                    const newTicketsSold = film.tickets_sold + 1;
                    // Update tickets sold on the server
                    fetch(`http://localhost:3000/films/${filmId}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ tickets_sold: newTicketsSold }),
                    })
                        .then(response => response.json())
                        .then(updatedFilm => {
                            updateFilmDetails(updatedFilm);
                        });
                }
            });
    }
    //delete a film from the server and remove it from the UI
    function deleteFilm(filmId, filmElement) {
        fetch(`http://localhost:3000/films/${filmId}`, {
            method: "DELETE",
        })
            .then(response => {
                if (response.ok) {
                    filmElement.remove(); 
                }
            });
    }
});