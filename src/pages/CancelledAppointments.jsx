import React from "react";
import AppointmentsTable from "../components/dashboard/AppointmentsTable";

function CancelledAppointments() {
  return (
    <AppointmentsTable
      endpoint="/dashboard/appointments/cancelled/"
      title="Cancelled Appointments"
      description="View all past cancelled bookings."
      emptyTitle="No Cancelled Appointments"
    />
  );
}

export default CancelledAppointments;
