import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "/api/v1";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOT_DURATIONS = [15, 30, 45, 60];
const TODAY = new Date().toISOString().split("T")[0];

function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { token } = useAuth();

  // Saving states per section
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [savingBreaks, setSavingBreaks] = useState(false);
  const [savingHolidays, setSavingHolidays] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/provider-settings/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        setSettings(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchSettings();
  }, [token]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const saveGeneralSettings = async () => {
    setSavingGeneral(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/provider-settings/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          provider_name: settings.provider_name,
          timezone: settings.timezone,
          slot_duration: settings.slot_duration,
        }),
      });
      if (!res.ok) throw new Error("Failed to save general settings");
      showSuccess("General settings saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingGeneral(false);
    }
  };

  const saveSchedule = async () => {
    setSavingSchedule(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/provider-settings/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ day_schedules: settings.day_schedules }),
      });
      if (!res.ok) throw new Error("Failed to save schedule");
      showSuccess("Weekly schedule saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingSchedule(false);
    }
  };

  const saveBreaks = async () => {
    setSavingBreaks(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/provider-settings/breaks/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ breaks: settings.break_times }),
      });
      if (!res.ok) throw new Error("Failed to save break times");
      showSuccess("Break times saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingBreaks(false);
    }
  };

  const saveHolidays = async () => {
    setSavingHolidays(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/provider-settings/holidays/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ holidays: settings.holidays }),
      });
      if (!res.ok) throw new Error("Failed to save holidays");
      showSuccess("Holidays saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingHolidays(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await fetch(`${API_BASE}/calendar/login/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch OAuth URL");
      const data = await res.json();
      window.location.href = data.data.auth_url;
    } catch (err) {
      setError(err.message);
    }
  };

  const updateDaySchedule = (dayIndex, field, value) => {
    const updated = { ...settings.day_schedules };
    if (!updated[dayIndex]) updated[dayIndex] = { is_active: false, start: "09:00", end: "17:00" };
    updated[dayIndex][field] = value;

    // If a day becomes inactive, remove any breaks associated with it
    if (field === "is_active" && value === false) {
      const updatedBreaks = settings.break_times.filter(br => br.weekday !== parseInt(dayIndex));
      setSettings({ ...settings, day_schedules: updated, break_times: updatedBreaks });
      return;
    }

    setSettings({ ...settings, day_schedules: updated });
  };

  // Compute active days for breaks dropdown
  const activeDays = WEEKDAYS.map((day, index) => ({ name: day, index })).filter(
    (d) => settings?.day_schedules?.[String(d.index)]?.is_active
  );

  const addBreak = () => {
    if (activeDays.length === 0) {
      setError("Please enable at least one working day in the schedule first.");
      return;
    }
    setSettings({
      ...settings,
      break_times: [...settings.break_times, { weekday: activeDays[0].index, start: "12:00", end: "13:00", label: "Lunch" }],
    });
  };

  const removeBreak = (index) => {
    const updated = [...settings.break_times];
    updated.splice(index, 1);
    setSettings({ ...settings, break_times: updated });
  };

  const updateBreak = (index, field, value) => {
    const updated = [...settings.break_times];
    updated[index][field] = value;
    setSettings({ ...settings, break_times: updated });
  };

  const addHoliday = () => {
    setSettings({
      ...settings,
      holidays: [...settings.holidays, { date: "", label: "Holiday" }],
    });
  };

  const removeHoliday = (index) => {
    const updated = [...settings.holidays];
    updated.splice(index, 1);
    setSettings({ ...settings, holidays: updated });
  };

  const updateHoliday = (index, field, value) => {
    const updated = [...settings.holidays];
    updated[index][field] = value;
    setSettings({ ...settings, holidays: updated });
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="card" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2>Provider Settings & Availability</h2>
        <button type="button" className="btn-secondary" onClick={handleConnectGoogle}>
           Connect Google Calendar
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && (
        <div style={{ background: "#ECFDF5", color: "#059669", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
          {success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "2.5rem", alignItems: "start" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {/* Section 1: General Settings */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E5E7EB", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0 }}>General Settings</h3>
            <button className="btn-primary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }} onClick={saveGeneralSettings} disabled={savingGeneral}>
              {savingGeneral ? "Saving..." : "Save General Settings"}
            </button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="providerName">Provider Name</label>
              <input
                id="providerName"
                type="text"
                value={settings?.provider_name || ""}
                onChange={(e) => setSettings({ ...settings, provider_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="timezone">Timezone</label>
              <input
                id="timezone"
                type="text"
                value={settings?.timezone || ""}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label>Slot Duration</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {SLOT_DURATIONS.map(dur => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSettings({ ...settings, slot_duration: dur })}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "9999px",
                    border: settings?.slot_duration === dur ? "2px solid var(--brand-blue)" : "1px solid #D1D5DB",
                    background: settings?.slot_duration === dur ? "#EFF6FF" : "#FFF",
                    color: settings?.slot_duration === dur ? "var(--brand-blue)" : "#4B5563",
                    cursor: "pointer",
                    fontWeight: settings?.slot_duration === dur ? "600" : "400"
                  }}
                >
                  {dur} mins
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Weekly Schedule */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E5E7EB", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0 }}>Weekly Schedule</h3>
            <button className="btn-primary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }} onClick={saveSchedule} disabled={savingSchedule}>
              {savingSchedule ? "Saving..." : "Save Schedule"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {WEEKDAYS.map((day, idx) => {
              const dayStr = String(idx);
              const dayObj = settings?.day_schedules?.[dayStr] || { is_active: false, start: "09:00", end: "17:00" };
              return (
                <div key={day} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: "120px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={dayObj.is_active}
                      onChange={(e) => updateDaySchedule(dayStr, "is_active", e.target.checked)}
                    />
                    <label style={{ margin: 0 }}>{day}</label>
                  </div>
                  {dayObj.is_active ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input type="time" value={dayObj.start} onChange={(e) => updateDaySchedule(dayStr, "start", e.target.value)} />
                      <span>to</span>
                      <input type="time" value={dayObj.end} onChange={(e) => updateDaySchedule(dayStr, "end", e.target.value)} />
                    </div>
                  ) : (
                    <div style={{ color: "#9CA3AF" }}>Closed</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

        {/* Section 3: Break Times */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E5E7EB", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0 }}>Break Times</h3>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="button" onClick={addBreak} style={{ background: "none", border: "none", color: "var(--brand-blue)", cursor: "pointer", fontWeight: "600" }}>+ Add Break</button>
              <button className="btn-primary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }} onClick={saveBreaks} disabled={savingBreaks}>
                {savingBreaks ? "Saving..." : "Save Breaks"}
              </button>
            </div>
          </div>
          {(!settings?.break_times || settings.break_times.length === 0) && (
            <p style={{ color: "#6B7280" }}>No break times configured.</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {settings?.break_times?.map((brk, idx) => (
              <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                <select value={brk.weekday} onChange={(e) => updateBreak(idx, "weekday", parseInt(e.target.value))} style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #D1D5DB" }}>
                  {activeDays.map((d) => <option key={d.index} value={d.index}>{d.name}</option>)}
                </select>
                <input type="time" value={brk.start} onChange={(e) => updateBreak(idx, "start", e.target.value)} />
                <span>to</span>
                <input type="time" value={brk.end} onChange={(e) => updateBreak(idx, "end", e.target.value)} />
                <input type="text" placeholder="Label (e.g. Lunch)" value={brk.label} onChange={(e) => updateBreak(idx, "label", e.target.value)} />
                <button type="button" onClick={() => removeBreak(idx)} style={{ background: "#FEE2E2", border: "1px solid #FECACA", color: "#DC2626", cursor: "pointer", padding: "0.5rem", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }} title="Remove Break">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Holidays */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E5E7EB", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0 }}>Holidays / Days Off</h3>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="button" onClick={addHoliday} style={{ background: "none", border: "none", color: "var(--brand-blue)", cursor: "pointer", fontWeight: "600" }}>+ Add Holiday</button>
              <button className="btn-primary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }} onClick={saveHolidays} disabled={savingHolidays}>
                {savingHolidays ? "Saving..." : "Save Holidays"}
              </button>
            </div>
          </div>
          {(!settings?.holidays || settings.holidays.length === 0) && (
            <p style={{ color: "#6B7280" }}>No holidays configured.</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {settings?.holidays?.map((hol, idx) => (
              <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                <input type="date" min={TODAY} value={hol.date} onChange={(e) => updateHoliday(idx, "date", e.target.value)} />
                <input type="text" placeholder="Label (e.g. Christmas)" value={hol.label} onChange={(e) => updateHoliday(idx, "label", e.target.value)} />
                <button type="button" onClick={() => removeHoliday(idx)} style={{ background: "#FEE2E2", border: "1px solid #FECACA", color: "#DC2626", cursor: "pointer", padding: "0.5rem", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }} title="Remove Holiday">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
      </div>
    </div>
  );
}

export default Settings;
