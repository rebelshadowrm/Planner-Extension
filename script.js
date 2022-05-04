 
 //! set to proper port on test
const root = 'https://localhost:5001'

let username
let userId

const userApi = '/api/UsersAPI/'
const eventApi = '/api/EventsAPI/'
const noteApi = '/api/NotesAPI/'

const calendarContainer = document.querySelector('#calendar-container')
const calendarEl = document.querySelector('#calendar')
const calendarBtn = document.querySelector('#calendarBtn')

const notesContainer = document.querySelector('#notes-container')
const notesEl = document.querySelector('#notes')
const notesBtn = document.querySelector('#notesBtn')

const header = document.querySelector('header')
const formContainer = document.querySelector('#form-container')
const submit = document.querySelector('#submit')
submit.addEventListener('click', async (e) => {
    e.preventDefault()

    const name = e.target.parentNode.querySelector('#username').value
    userId = await getUserId(name)
    username = name

    formContainer?.classList?.remove('show')
    header?.classList?.add('show')
    calendarBtn?.classList?.add('active')
    calendarContainer?.classList?.add('show')
    notesBtn?.classList?.remove('active')
    notesContainer?.classList?.remove('show')
    await loadCalendar()
})

//defines property .clearChildren; clears all children
if( typeof Element.prototype.clearChildren === 'undefined' ) {
    Object.defineProperty(Element.prototype, 'clearChildren', {
       configurable: true,
       enumerable: false,
       value: function() {
         while(this.firstChild) this.removeChild(this.lastChild)
       }
     })
 }

 const getUserId = async (name) => {
    try {
        const res = await fetch(`${root}${userApi}${name}`)
        if(res.status === 200) {
            const data = await res.json()
            if(data[0]?.id) {
                return data[0]?.id
            }
        }
    } catch(err) {
        console.log(err.message)
    }
 }


calendarBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    if(!calendarBtn?.classList?.contains('active')) {
        calendarBtn?.classList?.add('active')
        calendarContainer?.classList?.add('show')
        notesBtn?.classList?.remove('active')
        notesContainer?.classList?.remove('show')
        await loadCalendar()
    }
})

notesBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    if(!notesBtn?.classList?.contains('active')) {
        calendarBtn.classList.remove('active')
        calendarContainer?.classList?.remove('show')
        notesBtn?.classList?.add('active')
        notesContainer?.classList?.add('show')
        await loadNotes()
    }
})

document.addEventListener('DOMContentLoaded', async () => {
        if(calendarEl) {
            await loadCalendar()
        }
        if(notesEl) {
            await loadNotes()
        }
})

const loadCalendar = async () => {
    try {
        let calendarOptions = {
            height: '100%',
            slotMinTime: '08:00',
            slotMaxTime: '20:00',
            headerToolbar: {
                left: 'title',
                center: '',
                right: 'prev,next today'
            },
            initialView: 'listWeek',
            initialDate: new Date().toISOString("yyyy-MM-dd"),
            events: [],
        }
        if(username) {
            const res = await fetch(`${root}${eventApi}${username}`)
            if(res.status === 200) {
                const data = await res.json()
                let events = []
                data.forEach( e => {
                    const event = {
                        title: e.eventName,
                        start: e.startDate,
                        end: e.endDate,
                        extendedProps: {
                            eventId: e.eventId,
                            description: e.description,
                            author: e.userName
                        }
                    }
                    events.push(event)
                })
                // Set events
                calendarOptions.events = events
            }
        }
        const calendar = new FullCalendar.Calendar(calendarEl, calendarOptions)
        await calendar.render()

    } catch(err) {
    console.log(err.message)
    }
}

const loadNotes = async () => {
    try {
        const res = await fetch(`${root}${noteApi}${userId}`)
        if(res.status === 200) {
            const data = await res.json()
             createNotes(data)
        }
    } catch(err) {
        console.log(err.message)
    }
}

const createNotes = (data) => {
    const noteTemplate = document.querySelector('#note')
    const noteContainer = document.querySelector('.notes')
    noteContainer.clearChildren()

    data.forEach( e => {
        const noteClone = noteTemplate.content.cloneNode(true)
        const title = noteClone.querySelector('.note-title')
        title.textContent = e?.title
        const body = noteClone.querySelector('.note-body')
        body.textContent = e?.text
        const border = noteClone.querySelector('.note')
        border.style.borderColor = e?.color
        const header = noteClone.querySelector('.note-title-container')
        header.style.backgroundColor = e?.color
        const note = noteClone.querySelector('.note')
        note.dataset.noteid = e?.noteId
        note.dataset.userid = e?.userId
        note.dataset.color = e?.color
        note.dataset.eventid = e?.eventId
        
        noteContainer.appendChild(noteClone)
    })
}


document.addEventListener('click', async (event) => {
    if (event.target.matches('.delete')) {
        const type = event.target.parentNode.parentNode.dataset.type
        if (type === "note") await deleteNote(event)
        if (type === "event") await deleteEvent(event)
    }
    if (event.target.matches('.edit')) {
        const type = event.target.parentNode.parentNode.dataset.type
        if (type === "note") noteEditBtn(event)
        if (type === "event") eventEditBtn(event)
    }
    if (event.target.matches('.save')) {
        const type = event.target.parentNode.parentNode.dataset.type
        if (type === "note") await saveNote(event)
        if (type === "event") await saveEvent(event)
    }
    return
}, false);

const noteEditBtn = (e) => {
    e.preventDefault()
    const body = e.target.parentNode.parentNode.querySelector('.note-body')
    const saveIcon = e.target.parentNode.querySelector(".save")
    const editIcon = e.target.parentNode.querySelector(".edit")
    document.addEventListener('keyup', e => {
        if(e.key == 'Escape') {
            if (editIcon.classList.contains('active')) {
                editIcon.classList.toggle("active")
                body.contentEditable = false
                saveIcon.classList.toggle("show")
            }
        }
    })
    if (!editIcon.classList.contains('active')) {
        editIcon.classList.toggle("active")
        body.contentEditable = true
        saveIcon.classList.toggle("show")
    } else {
        editIcon.classList.toggle("active")
        body.contentEditable = false
        saveIcon.classList.toggle("show")
    }
}

const deleteNote = async (e) => {
    e.preventDefault()
    const note = e.target.parentNode.parentNode.parentNode
    const NoteId = note.dataset.noteid
    const options = {
        method: 'DELETE',
    }

    const res = await fetch(`${root}${noteApi}${NoteId}`, options)
    if (res.status === 204) {
        note.remove()
    }
}

const saveNote = async (e) => {
    e.preventDefault()
    const note = e.target.parentNode.parentNode.parentNode
    const NoteId = note?.dataset?.noteid
    const UserId = note?.dataset?.userid
    const EventId = note?.dataset?.eventid
    const Color = note?.dataset?.color
    const Title = note.querySelector('.note-title')?.textContent
    const noteBody = note.querySelector('.note-body')
    const Text = noteBody?.textContent

    const body = {
        NoteId,
        UserId,
        EventId,
        Color,
        Title,
        Text
    }

    const options = {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'content-type': 'application/json'
        },
        body:JSON.stringify(body)
    }


    const res = await fetch(`${root}${noteApi}${NoteId}`, options)
    if (res.status === 204) {
        const saveIcon = e.target.parentNode.querySelector(".save")
        const editIcon = e.target.parentNode.querySelector(".edit")
        editIcon.classList.toggle("active")
        noteBody.contentEditable = false
        saveIcon.classList.toggle("show")
    }
}


