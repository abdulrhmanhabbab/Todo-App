const calendarDays = document.getElementById('calendar-days')
const monthYear = document.getElementById('month-year')
const selectedDayTitle = document.getElementById('selected-day')
const taskList = document.getElementById('task-list')
const emptyMessage = document.getElementById('empty-message')
const taskForm = document.getElementById('task-form')
const inputTask = document.getElementById('input-task')
const taskDate = document.getElementById('task-date')
const taskTime = document.getElementById('task-time')
const formMessage = document.getElementById('form-message')
const previousWeek = document.getElementById('previous-week')
const nextWeek = document.getElementById('next-week')
const todayBtn = document.getElementById('today-btn')
const filterButtons = document.querySelectorAll('.filter-btn')

const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
let selectedDate = new Date()
let tasks = JSON.parse(localStorage.getItem('dayByDayTasks')) || {}
let selectedFilter = 'all'

function getDateKey(date) {
    let year = date.getFullYear()
    let month = String(date.getMonth() + 1).padStart(2, '0')
    let day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function createDate(dateValue) {
    let parts = dateValue.split('-')
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
}

function getTimeValue(date) {
    let hours = String(date.getHours()).padStart(2, '0')
    let minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

function setDefaultDateTime() {
    let currentDate = new Date()
    taskDate.value = getDateKey(currentDate)
    taskTime.value = getTimeValue(currentDate)
}

function getWeekStart(date) {
    let firstDay = new Date(date)
    let dayNumber = firstDay.getDay()
    let difference = dayNumber == 0 ? -6 : 1 - dayNumber
    firstDay.setDate(firstDay.getDate() + difference)
    return firstDay
}

function isSameDate(firstDate, secondDate) {
    return getDateKey(firstDate) == getDateKey(secondDate)
}

function renderCalendar() {
    calendarDays.innerHTML = ''
    let weekStart = getWeekStart(selectedDate)
    let weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    if (weekStart.getMonth() == weekEnd.getMonth()) {
        monthYear.innerHTML = weekStart.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        }).toUpperCase()
    }
    else {
        let startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' })
        let endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        monthYear.innerHTML = `${startMonth} / ${endMonth}`.toUpperCase()
    }

    for (let i = 0; i < 7; i++) {
        let date = new Date(weekStart)
        date.setDate(weekStart.getDate() + i)

        let dayButton = document.createElement('button')
        let dateKey = getDateKey(date)
        dayButton.className = 'day'
        dayButton.type = 'button'
        dayButton.dataset.date = dateKey
        dayButton.innerHTML = `
            <span class="day-name">${dayNames[date.getDay()]}</span>
            <span class="day-number">${date.getDate()}</span>
        `

        if (isSameDate(date, selectedDate)) {
            dayButton.classList.add('selected')
        }
        if (isSameDate(date, new Date())) {
            dayButton.classList.add('today')
        }
        if (tasks[dateKey] && tasks[dateKey].length > 0) {
            dayButton.classList.add('has-tasks')
        }

        calendarDays.appendChild(dayButton)
    }
}

function renderTasks() {
    let dateKey = getDateKey(selectedDate)
    let selectedTasks = [...(tasks[dateKey] || [])]
    selectedTasks.sort(function (firstTask, secondTask) {
        return firstTask.time.localeCompare(secondTask.time)
    })

    let filteredTasks = selectedTasks.filter(function (task) {
        if (selectedFilter == 'pending') {
            return !task.completed
        }
        else if (selectedFilter == 'completed') {
            return task.completed
        }
        return true
    })

    taskList.innerHTML = ''
    selectedDayTitle.innerHTML = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })
    taskDate.value = dateKey

    filteredTasks.forEach(function (task) {
        let li = document.createElement('li')
        li.className = 'task-item'
        li.dataset.id = task.id

        if (task.completed) {
            li.classList.add('checked')
        }

        li.innerHTML = `
            <span class="task-time">${task.time || '--:--'}</span>
            <button class="task-content" type="button" aria-label="Complete task">
                <strong></strong>
                <small>${task.completed ? 'Completed' : ''}</small>
            </button>
            <div class="task-actions">
                <button class="check-task" type="button" aria-label="Complete task">&#10003;</button>
                <button class="delete-task" type="button" aria-label="Delete task">&#215;</button>
            </div>
        `
        li.querySelector('strong').textContent = task.text
        taskList.appendChild(li)
    })

    emptyMessage.style.display = filteredTasks.length == 0 ? 'block' : 'none'
    if (selectedFilter == 'pending') {
        emptyMessage.querySelector('p').innerHTML = 'No pending tasks for this day.'
        emptyMessage.querySelector('span').innerHTML = 'Everything planned for this day is complete.'
    }
    else if (selectedFilter == 'completed') {
        emptyMessage.querySelector('p').innerHTML = 'No completed tasks for this day.'
        emptyMessage.querySelector('span').innerHTML = 'Completed plans will appear here.'
    }
    else {
        emptyMessage.querySelector('p').innerHTML = 'No tasks planned for this day.'
        emptyMessage.querySelector('span').innerHTML = 'Add a quiet little plan when you are ready.'
    }

    filterButtons.forEach(function (button) {
        button.classList.toggle('active', button.dataset.filter == selectedFilter)
    })

    let completedTasks = selectedTasks.filter(function (task) {
        return task.completed
    }).length
}

function renderPage() {
    renderCalendar()
    renderTasks()
}

function setTasks() {
    localStorage.setItem('dayByDayTasks', JSON.stringify(tasks))
}

function addTask(e) {
    e.preventDefault()
    let taskValue = inputTask.value.trim()

    if (!taskValue) {
        formMessage.innerHTML = 'Please write a task first.'
        inputTask.focus()
        return
    }

    let currentDate = new Date()
    let dateKey = taskDate.value || getDateKey(currentDate)
    let timeValue = taskTime.value || getTimeValue(currentDate)
    if (!tasks[dateKey]) {
        tasks[dateKey] = []
    }

    tasks[dateKey].push({
        id: Date.now(),
        text: taskValue,
        time: timeValue,
        completed: false
    })

    selectedDate = createDate(dateKey)
    inputTask.value = ''
    formMessage.innerHTML = ''
    setTasks()
    renderPage()
    setDefaultDateTime()
}

calendarDays.addEventListener('click', function (e) {
    let day = e.target.closest('.day')
    if (day) {
        selectedDate = createDate(day.dataset.date)
        renderPage()
    }
})

taskList.addEventListener('click', function (e) {
    let taskItem = e.target.closest('.task-item')
    if (!taskItem) {
        return
    }

    let dateKey = getDateKey(selectedDate)
    let taskId = Number(taskItem.dataset.id)
    let task = tasks[dateKey].find(function (item) {
        return item.id == taskId
    })

    if (e.target.closest('.delete-task')) {
        tasks[dateKey] = tasks[dateKey].filter(function (item) {
            return item.id != taskId
        })
        if (tasks[dateKey].length == 0) {
            delete tasks[dateKey]
        }
    }
    else if (e.target.closest('.task-content') || e.target.closest('.check-task')) {
        task.completed = !task.completed
    }

    setTasks()
    renderPage()
})

previousWeek.addEventListener('click', function () {
    selectedDate.setDate(selectedDate.getDate() - 7)
    renderPage()
})

nextWeek.addEventListener('click', function () {
    selectedDate.setDate(selectedDate.getDate() + 7)
    renderPage()
})

todayBtn.addEventListener('click', function () {
    selectedDate = new Date()
    renderPage()
})

filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        selectedFilter = button.dataset.filter
        renderTasks()
    })
})

taskForm.addEventListener('submit', addTask)

renderPage()
setDefaultDateTime()
