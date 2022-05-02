document.addEventListener('DOMContentLoaded', async () => {
    try {
        //! set to proper port on test
        const root = 'https://localhost:5001'
        //! username for test
        const username = 'rebelshadowrm@gmail.com'
        // Api base paths
        const eventApi = '/api/EventsAPI/'
        const noteApi = '/api/NotesAPI/'

        const calendarEl = document.querySelector('#calendar')
        // hacky username provision, decode from JWT or get from global state
        if(calendarEl) {
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

            // decode your JWT or get username from global state
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
        }
    } catch(err) {
        console.log(err.message)
    }
})