document.addEventListener("DOMContentLoaded",  async () => {
    const url = 'https://localhost:5001/api/EventsAPI'
    const res = await fetch(url)
    console.log(res)
    if(res?.ok) {
        const data = await res.json()
        const cardTemplate = document.querySelector('#card-template')
        const cardContainer = document.querySelector('.calendar-cards')
        data.forEach( elem => {
            const cardClone = cardTemplate.content.cloneNode(true)
            const dateStart = cardClone.querySelector('.date-start')
            dateStart.innerHtml = elem?.startDate
            const dateEnd = cardClone.querySelector('.date-end')
            dateEnd.innerHTML = elem?.endDate
            const title = cardClone.querySelector('.title')
            title.innerHTML = elem?.eventName
            const description = cardClone.querySelector('.description')
            description.innerHTML = elem?.description
            cardContainer.append(cardClone)
        })
    }
})