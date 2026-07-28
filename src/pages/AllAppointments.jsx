import React from "react";
import AppointmentsTable from "../components/dashboard/AppointmentsTable";

function AllAppointments() {
  return (
    <AppointmentsTable
      endpoint="/dashboard/appointments/all/"
      title="All Appointments"
      description="View your entire appointment history."
      emptyTitle="No Appointments Found"
    />
  );
}

export default AllAppointments;
