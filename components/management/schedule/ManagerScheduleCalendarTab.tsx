import { Calendar, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useState } from 'react'
import { setDate } from 'date-fns'

moment.locale("es")
// Setup the localizer by providing the moment (or globalize, or Luxon) Object
// to the correct localizer.
const localizer = momentLocalizer(moment) // or globalizeLocalizer

/*

title: string,
  start: Date,
  end: Date,
  allDay?: boolean
  resource?: any,

*/

const events = [{
    title: "testing",
    start: moment().toDate(),
    end: moment().clone().add(1, "week").toDate(),
    allDay: false,
    resource: "test"
}]
const ManagerScheduleCalendarTab = (props: any) => {
    const [viewType, setViewType] = useState<View>("week");
    const [currentDate, setCurrentDate] = useState(new Date());
    return (
        <div className="h-[512px] w-full">
            <Calendar
                date={currentDate}
                onNavigate={(d) => {
                    setCurrentDate(d)
                }}
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={viewType}
                onView={setViewType}
            />
        </div>
    )
}

export default ManagerScheduleCalendarTab