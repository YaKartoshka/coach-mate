const calendar = document.querySelector(".calendar"),
  date = document.querySelector(".date"),
  daysContainer = document.querySelector(".days"),
  prev = document.querySelector(".prev"),
  next = document.querySelector(".next"),
  todayBtn = document.querySelector(".today-btn"),
  gotoBtn = document.querySelector(".goto-btn"),
  dateInput = document.querySelector(".date-input"),
  eventDay = document.querySelector(".event-day"),
  eventDate = document.querySelector(".event-date"),
  eventsContainer = document.querySelector(".events");

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();
var first_init = true;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


function initCalendar() {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const prevLastDay = new Date(year, month, 0);
  const prevDays = prevLastDay.getDate();
  const lastDate = lastDay.getDate();
  const day = firstDay.getDay();
  const nextDays = 7 - lastDay.getDay() - 1;
  date.innerHTML = months[month] + " " + year;

  let days = "";

  for (let x = day; x > 0; x--) {
    days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
  }

  for (let i = 1; i <= lastDate; i++) {
    //check if event is present on that day
    let event = false;

    if (
      i === new Date().getDate() &&
      year === new Date().getFullYear() &&
      month === new Date().getMonth()
    ) {
    
      if (first_init) {
        first_init = false
        activeDay = i;
        let next_month = month + 1;
        setTimeout(()=>{
          showEvents(activeDay, next_month, year);
        },500)
      }

      getActiveDay(i);
  
      if (event) {

        days += `<div class="day today active event">${i}</div>`;
      } else {
   
        if (activeDay == i) {
          days += `<div class="day today active">${i}</div>`;
        } else {
          days += `<div class="day today">${i}</div>`;
        }
      }
    } else {
      
      if (event) {
        days += `<div class="day event">${i}</div>`;
      } else if (activeDay == i) {
        days += `<div class="day today active">${i}</div>`;
      }  else {

        days += `<div class="day ">${i}</div>`;
      }
    }
  }

  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="day next-date">${j}</div>`;
  }
  daysContainer.innerHTML = days;
  addListner();
}

//function to add month and year on prev and next button
function prevMonth(day) {
  if(day){
    activeDay = day
  }
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  initCalendar(activeDay);
  getActiveDay(activeDay);
  let next_month = month == 0 ? 1 : month + 1;
  showEvents(activeDay, next_month, year);
}

function nextMonth(day) {
  if(day){
    activeDay = day
  }
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }

  initCalendar();
  getActiveDay(activeDay);
  let next_month = month == 0 ? 1 : month + 1;
  showEvents(activeDay, next_month, year);
}




//function to add active on day
function addListner() {
  const days = document.querySelectorAll(".day");
  days.forEach((day) => {
    day.addEventListener("click", (e) => {
      getActiveDay(e.target.innerHTML);
      activeDay = Number(e.target.innerHTML);

      //remove active
      days.forEach((day) => {
        day.classList.remove("active");
      });
      //if clicked prev-date or next-date switch to that month
      if (e.target.classList.contains("prev-date")) {
        prevMonth();
        //add active to clicked day afte month is change
        setTimeout(() => {
          //add active where no prev-date or next-date
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("prev-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");

            }
          });
        }, 100);
      } else if (e.target.classList.contains("next-date")) {
        nextMonth();
        //add active to clicked day afte month is changed
        setTimeout(() => {
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("next-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else {
        e.target.classList.add("active");
        let next_month = month + 1
        showEvents(activeDay, next_month, year)
      }
    });
  });
}

todayBtn.addEventListener("click", () => {
  today = new Date();
  month = today.getMonth();
  year = today.getFullYear();
  initCalendar();
});

dateInput.addEventListener("input", (e) => {
  dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
  if (dateInput.value.length === 2) {
    dateInput.value += "/";
  }
  if (dateInput.value.length > 7) {
    dateInput.value = dateInput.value.slice(0, 7);
  }
  if (e.inputType === "deleteContentBackward") {
    if (dateInput.value.length === 3) {
      dateInput.value = dateInput.value.slice(0, 2);
    }
  }
});

gotoBtn.addEventListener("click", gotoDate);

function gotoDate() {
  console.log("here");
  const dateArr = dateInput.value.split("/");
  if (dateArr.length === 2) {
    if (dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
      month = dateArr[0] - 1;
      year = dateArr[1];
      initCalendar();
      return;
    }
  }
  alert("Invalid Date");
}

function getActiveDay(date) {
  const day = new Date(year, month, date);
  const dayName = day.toString().split(" ")[0];
  eventDay.innerHTML = dayName;
  eventDate.innerHTML = date + " " + months[month] + " " + year;
  return day
}



function convertTime(time) {
  //convert time to 24 hour format
  let timeArr = time.split(":");
  let timeHour = timeArr[0];
  let timeMin = timeArr[1];
  let timeFormat = timeHour >= 12 ? "PM" : "AM";
  timeHour = timeHour % 12 || 12;
  time = timeHour + ":" + timeMin + " " + timeFormat;
  return time;
}

function showEvents(week_day, month, year) {
  
  $('.events').html('');
  var myDate = new Date(`${year}-${month}-${week_day}`);
  week_day = week_day < 10 ? `0${week_day}` : week_day
  var dayOfWeek = getDayName(myDate)
  let counter = 0;
  events.forEach((ed) => {
    // console.log(ed)
    if (ed.week_day == dayOfWeek) {
      counter++;
      let eventDiv = `
      <div class="event"> 
      <div class="time">${ed.time}</div>
      <div class="event_name">${ed.event_name}</div>
    </div>
       `
      $('.events').append(eventDiv);
    }

    if (ed.event_date == `${year}-${month}-${week_day}`) {
      counter++;
      let eventDiv = `
      <div class="event"> 
        <div class="time">${ed.time}</div>
        <div class="event_name">${ed.event_name}</div>
      </div>
    `
      $('.events').append(eventDiv);
    }



  });
  if (!counter) {
    let noEvents = `
    <div class="no-event">
          <h3>No Events</h3>
      </div>
    `
    $('.events').append(noEvents);
  }
}


function getDayName(myDate) {
  var dayOfWeek = myDate.getDay();
  var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dayName = daysOfWeek[dayOfWeek];
  return dayName.toLowerCase();
}

// if (!week_day || !month || !year) {
//   no_event = `<div class="no-event">
//           <h3>No Events</h3>
//       </div>`;
// }

// alert(`${week_day}, ${month}, ${year} ${dayName}`)