import React, { useState, useEffect } from "react";
import Banner from "../components/Banner";
import { useAuth } from "../context/AuthContext";

const API_BASE = "/api/v1";

const SettingsSectionHeader = ({ title, itemName, onAdd, onSave, isSaving, disabled = false }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
      borderBottom: "1px solid var(--border-light)",
      paddingBottom: "1rem",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <h3 style={{ margin: 0, fontSize: "1.125rem" }}>{title}</h3>
      <button
        type="button"
        onClick={onAdd}
        style={{
          background: "none",
          border: "none",
          color: "var(--brand-primary)",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "0.875rem",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add {itemName}
      </button>
    </div>
    <button
      type="button"
      className="btn btn-primary"
      style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}
      onClick={onSave}
      disabled={isSaving || disabled}
    >
      {isSaving ? "Saving..." : `Save ${title}`}
    </button>
  </div>
);

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOT_DURATIONS = [15, 30, 45, 60];
const TODAY = new Date().toISOString().split("T")[0];

function Settings() {
  const [settings, setSettings] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { token } = useAuth();

  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [savingBreaks, setSavingBreaks] = useState(false);
  const [savingHolidays, setSavingHolidays] = useState(false);
  const [breakErrors, setBreakErrors] = useState({});

  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/provider-settings/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        setSettings(data.data);
        setOriginalSettings(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchSettings();
  }, [token]);

  useEffect(() => {
    if (!token || !settings?.is_google_connected) return;
    fetch(`${API_BASE}/admin/my-calendars/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCalendars(data.data ?? []))
      .catch(() => {}); // non-critical, silently ignore
  }, [token, settings?.is_google_connected]);

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
          calendar_id: settings.calendar_id,
        }),
      });
      if (!res.ok) throw new Error("Failed to save general settings");
      showSuccess("General settings saved successfully.");
      setOriginalSettings((prev) => ({
        ...prev,
        provider_name: settings.provider_name,
        timezone: settings.timezone,
        slot_duration: settings.slot_duration,
        calendar_id: settings.calendar_id,
      }));
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
      setOriginalSettings((prev) => ({
        ...prev,
        day_schedules: settings.day_schedules,
      }));
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
      setOriginalSettings((prev) => ({
        ...prev,
        break_times: settings.break_times,
      }));
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
      setOriginalSettings((prev) => ({
        ...prev,
        holidays: settings.holidays,
      }));
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

  const hasUnsavedChanges = () => {
    if (!settings || !originalSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  };

  const updateDaySchedule = (dayIndex, field, value) => {
    const updated = { ...settings.day_schedules };
    if (!updated[dayIndex]) updated[dayIndex] = { is_active: false, start: "09:00", end: "17:00" };
    updated[dayIndex][field] = value;

    if (field === "is_active" && value === false) {
      const updatedBreaks = settings.break_times.filter(
        (br) => br.weekday !== Number.parseInt(dayIndex)
      );
      setSettings({ ...settings, day_schedules: updated, break_times: updatedBreaks });
      return;
    }

    setSettings({ ...settings, day_schedules: updated });
  };

  const applyMondayToAll = () => {
    const mondaySchedule = settings.day_schedules?.["0"];
    if (!mondaySchedule) return;

    const updated = { ...settings.day_schedules };
    for (let i = 0; i < 7; i++) {
      if (updated[String(i)]) {
        updated[String(i)] = {
          ...updated[String(i)],
          start: mondaySchedule.start,
          end: mondaySchedule.end,
        };
      } else {
        updated[String(i)] = {
          is_active: false,
          start: mondaySchedule.start,
          end: mondaySchedule.end,
        };
      }
    }
    setSettings({ ...settings, day_schedules: updated });
  };

  const activeDays = WEEKDAYS.map((day, index) => ({ name: day, index })).filter(
    (d) => settings?.day_schedules?.[String(d.index)]?.is_active
  );

  const addBreak = () => {
    if (activeDays.length === 0) {
      setError("Please enable at least one working day in the schedule first.");
      return;
    }
    const day = settings.day_schedules[String(activeDays[0].index)];
    setSettings({
      ...settings,
      break_times: [
        ...settings.break_times,
        {
          id: crypto.randomUUID(),
          weekday: activeDays[0].index,
          start: day ? day.start : "12:00",
          end: day ? day.end : "13:00",
          label: "Lunch",
        },
      ],
    });
  };

  const removeBreak = (index) => {
    const updated = [...settings.break_times];
    const removed = updated.splice(index, 1)[0];
    setBreakErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[removed.id];
      return newErrors;
    });
    setSettings({ ...settings, break_times: updated });
  };

  const applyBreakOverlapStrategy = (newBreak, existingBreaks) => {
    const sameDayBreaks = existingBreaks.filter(
      (b) => b.id !== newBreak.id && b.weekday === newBreak.weekday
    );
    const overlapping = sameDayBreaks.filter(
      (b) => newBreak.start < b.end && b.start < newBreak.end
    );

    for (const b of overlapping) {
      const newContainsExisting = newBreak.start <= b.start && newBreak.end >= b.end;
      const existingContainsNew = b.start <= newBreak.start && b.end >= newBreak.end;

      if (existingContainsNew) {
        return { action: "block", message: `Already covered by ${b.start}-${b.end}.` };
      }
      if (!newContainsExisting) {
        return { action: "block", message: `Partially overlaps with ${b.start}-${b.end}.` };
      }
    }

    const breaksToRemove = overlapping.filter(
      (b) => newBreak.start <= b.start && newBreak.end >= b.end
    );
    return { action: "replace", removeIds: breaksToRemove.map((b) => b.id) };
  };

  const updateBreak = (index, field, value) => {
    let updated = [...settings.break_times];
    updated[index] = { ...updated[index], [field]: value };
    const currentBreak = updated[index];

    let errorMsg = null;
    if (currentBreak.start >= currentBreak.end) {
      errorMsg = "Start time must be before end time.";
    } else {
      const day = settings.day_schedules[String(currentBreak.weekday)];
      if (day && day.is_active) {
        if (currentBreak.start < day.start || currentBreak.end > day.end) {
          errorMsg = "Break must be within working hours.";
        }
      }
    }

    if (errorMsg) {
      setBreakErrors((prev) => ({ ...prev, [currentBreak.id]: errorMsg }));
      setSettings({ ...settings, break_times: updated });
      return;
    }

    const strategy = applyBreakOverlapStrategy(currentBreak, updated);
    if (strategy.action === "block") {
      setBreakErrors((prev) => ({ ...prev, [currentBreak.id]: strategy.message }));
      setSettings({ ...settings, break_times: updated });
    } else if (strategy.action === "replace") {
      if (strategy.removeIds.length > 0) {
        updated = updated.filter((b) => !strategy.removeIds.includes(b.id));
        showSuccess(`${strategy.removeIds.length} overlapping break(s) replaced.`);
      }
      setBreakErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[currentBreak.id];
        return newErrors;
      });
      setSettings({ ...settings, break_times: updated });
    }
  };

  const addHoliday = () => {
    setSettings({
      ...settings,
      holidays: [...settings.holidays, { id: crypto.randomUUID(), date: "", label: "Holiday" }],
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

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <div
          className="typing-dot"
          style={{
            display: "inline-block",
            width: "12px",
            height: "12px",
            background: "var(--brand-primary)",
            animationDuration: "1s",
          }}
        ></div>
        <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "3rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Provider Settings</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage your profile, availability, and business rules.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleConnectGoogle}
          disabled={settings?.is_google_connected}
          style={
            settings?.is_google_connected
              ? {
                  opacity: 0.8,
                  cursor: "not-allowed",
                  color: "var(--success-color)",
                  borderColor: "var(--success-color)",
                }
              : {}
          }
        >
          {settings?.is_google_connected ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          )}
          {settings?.is_google_connected ? "Calendar Connected" : "Connect Google Calendar"}
        </button>
      </div>

      {hasUnsavedChanges() && (
        <div
          className="banner"
          style={{
            backgroundColor: "#fff3cd",
            color: "#856404",
            border: "1px solid #ffeeba",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ flexShrink: 0 }}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <div>
            <strong>You have unsaved changes!</strong> Please click &quot;Save&quot; in the relevant
            tab below to apply them.
          </div>
        </div>
      )}

      <Banner type="error" message={error} />
      <Banner type="success" message={success} />

      {/* Tabs Navigation */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          marginBottom: "2rem",
          borderBottom: "1px solid var(--border-light)",
          paddingBottom: "0",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 0",
            cursor: "pointer",
            fontWeight: activeTab === "general" ? "600" : "500",
            color: activeTab === "general" ? "var(--brand-primary)" : "var(--text-secondary)",
            borderBottom:
              activeTab === "general" ? "2px solid var(--brand-primary)" : "2px solid transparent",
            marginBottom: "-1px",
            transition: "all 0.2s ease",
          }}
        >
          General & Schedule
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("breaks")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 0",
            cursor: "pointer",
            fontWeight: activeTab === "breaks" ? "600" : "500",
            color: activeTab === "breaks" ? "var(--brand-primary)" : "var(--text-secondary)",
            borderBottom:
              activeTab === "breaks" ? "2px solid var(--brand-primary)" : "2px solid transparent",
            marginBottom: "-1px",
            transition: "all 0.2s ease",
          }}
        >
          Break Times
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("holidays")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 0",
            cursor: "pointer",
            fontWeight: activeTab === "holidays" ? "600" : "500",
            color: activeTab === "holidays" ? "var(--brand-primary)" : "var(--text-secondary)",
            borderBottom:
              activeTab === "holidays" ? "2px solid var(--brand-primary)" : "2px solid transparent",
            marginBottom: "-1px",
            transition: "all 0.2s ease",
          }}
        >
          Holidays & Time Off
        </button>
      </div>

      <div style={{ position: "relative" }}>
        {activeTab === "general" && (
          <GeneralTab
            settings={settings}
            setSettings={setSettings}
            savingGeneral={savingGeneral}
            saveGeneralSettings={saveGeneralSettings}
            savingSchedule={savingSchedule}
            saveSchedule={saveSchedule}
            calendars={calendars}
            updateDaySchedule={updateDaySchedule}
            applyMondayToAll={applyMondayToAll}
            WEEKDAYS={WEEKDAYS}
            SLOT_DURATIONS={SLOT_DURATIONS}
          />
        )}

        {activeTab === "breaks" && (
          <BreaksTab
            settings={settings}
            savingBreaks={savingBreaks}
            saveBreaks={saveBreaks}
            addBreak={addBreak}
            removeBreak={removeBreak}
            updateBreak={updateBreak}
            activeDays={activeDays}
            breakErrors={breakErrors}
          />
        )}

        {activeTab === "holidays" && (
          <HolidaysTab
            settings={settings}
            savingHolidays={savingHolidays}
            saveHolidays={saveHolidays}
            addHoliday={addHoliday}
            removeHoliday={removeHoliday}
            updateHoliday={updateHoliday}
            TODAY={TODAY}
          />
        )}
      </div>
    </div>
  );
}

function GeneralTab({
  settings,
  setSettings,
  savingGeneral,
  saveGeneralSettings,
  savingSchedule,
  saveSchedule,
  calendars,
  updateDaySchedule,
  applyMondayToAll,
  WEEKDAYS,
  SLOT_DURATIONS,
}) {
  const isMondayActive = settings?.day_schedules?.["0"]?.is_active;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
        gap: "2rem",
        alignItems: "start",
      }}
    >
      {/* General Profile Card */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            borderBottom: "1px solid var(--border-light)",
            paddingBottom: "1rem",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.125rem" }}>General Profile</h3>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}
            onClick={saveGeneralSettings}
            disabled={savingGeneral}
          >
            {savingGeneral ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="providerName" className="form-label">
            Provider Name
          </label>
          <input
            id="providerName"
            type="text"
            className="form-input"
            value={settings?.provider_name || ""}
            onChange={(e) => setSettings({ ...settings, provider_name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="timezone" className="form-label">
            Timezone
          </label>
          <input
            id="timezone"
            type="text"
            className="form-input"
            value={settings?.timezone || ""}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="calendarId" className="form-label">
            Booking Calendar
          </label>
          {calendars.length > 0 ? (
            <select
              id="calendarId"
              className="form-select"
              value={settings?.calendar_id || "primary"}
              onChange={(e) => setSettings({ ...settings, calendar_id: e.target.value })}
            >
              {calendars.map((cal) => (
                <option key={cal.id} value={cal.id}>
                  {cal.summary}
                </option>
              ))}
            </select>
          ) : (
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
              {settings?.is_google_connected
                ? "Loading calendars..."
                : "Connect Google Calendar above to choose a calendar."}
            </p>
          )}
        </div>

        <fieldset
          className="form-group"
          style={{ marginTop: "1rem", border: "none", padding: 0 }}
          aria-labelledby="slot-duration-label"
        >
          <legend className="form-label" id="slot-duration-label">
            Slot Duration
          </legend>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {SLOT_DURATIONS.map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => setSettings({ ...settings, slot_duration: dur })}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "var(--radius-full)",
                  border:
                    settings?.slot_duration === dur
                      ? "2px solid var(--brand-primary)"
                      : "1px solid var(--border-light)",
                  background:
                    settings?.slot_duration === dur
                      ? "var(--brand-primary-light)"
                      : "var(--bg-surface)",
                  color:
                    settings?.slot_duration === dur
                      ? "var(--brand-primary)"
                      : "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.875rem",
                  transition: "all var(--transition-fast)",
                }}
              >
                {dur} mins
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Weekly Schedule Card */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            borderBottom: "1px solid var(--border-light)",
            paddingBottom: "1rem",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.125rem" }}>Weekly Schedule</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {isMondayActive && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}
                onClick={applyMondayToAll}
                disabled={savingSchedule}
              >
                Apply to all working days
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}
              onClick={saveSchedule}
              disabled={savingSchedule}
            >
              {savingSchedule ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {WEEKDAYS.map((day, idx) => {
            const dayStr = String(idx);
            const dayObj = settings?.day_schedules?.[dayStr] || {
              is_active: false,
              start: "09:00",
              end: "17:00",
            };
            return (
              <div
                key={day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    width: "140px",
                  }}
                >
                  <label className="toggle-switch" aria-label={`Toggle ${day}`}>
                    <input
                      type="checkbox"
                      checked={dayObj.is_active}
                      onChange={(e) => updateDaySchedule(dayStr, "is_active", e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span
                    style={{
                      fontWeight: "500",
                      color: dayObj.is_active ? "var(--text-main)" : "var(--text-tertiary)",
                    }}
                  >
                    {day}
                  </span>
                </div>

                {dayObj.is_active ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                    <input
                      type="time"
                      className="form-input"
                      style={{ padding: "0.4rem", flex: 1 }}
                      value={dayObj.start}
                      onChange={(e) => updateDaySchedule(dayStr, "start", e.target.value)}
                    />
                    <span style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>to</span>
                    <input
                      type="time"
                      className="form-input"
                      style={{ padding: "0.4rem", flex: 1 }}
                      value={dayObj.end}
                      onChange={(e) => updateDaySchedule(dayStr, "end", e.target.value)}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      color: "var(--text-tertiary)",
                      fontSize: "0.875rem",
                      paddingLeft: "0.5rem",
                    }}
                  >
                    Closed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BreaksTab({
  settings,
  savingBreaks,
  saveBreaks,
  addBreak,
  removeBreak,
  updateBreak,
  activeDays,
  breakErrors = {},
}) {
  const hasErrors = Object.values(breakErrors).some((err) => !!err);

  return (
    <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <SettingsSectionHeader
        title="Break Times"
        itemName="Break"
        onAdd={addBreak}
        onSave={saveBreaks}
        isSaving={savingBreaks}
        disabled={hasErrors}
      />

      {(!settings?.break_times || settings.break_times.length === 0) && (
        <div className="empty-state" style={{ padding: "2rem 1rem" }}>
          <p>No break times configured.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {settings?.break_times?.map((brk, idx) => (
          <div
            key={brk.id || `brk-${idx}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "1.25rem",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-surface)",
            }}
          >
            {/* Row 1: Day, Label, Delete */}
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <select
                className="form-select"
                style={{ padding: "0.4rem", flex: 1 }}
                value={brk.weekday}
                onChange={(e) => updateBreak(idx, "weekday", Number.parseInt(e.target.value))}
              >
                {activeDays.map((d) => (
                  <option key={d.index} value={d.index}>
                    {d.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="form-input"
                style={{ padding: "0.4rem", flex: 2 }}
                placeholder="Label (e.g. Lunch)"
                value={brk.label}
                onChange={(e) => updateBreak(idx, "label", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeBreak(idx)}
                className="icon-btn danger"
                title="Remove Break"
                style={{ flexShrink: 0 }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Row 2: Time Range */}
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input
                type="time"
                className="form-input"
                style={{ padding: "0.4rem", flex: 1 }}
                value={brk.start}
                onChange={(e) => updateBreak(idx, "start", e.target.value)}
              />
              <span style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>to</span>
              <input
                type="time"
                className="form-input"
                style={{ padding: "0.4rem", flex: 1 }}
                value={brk.end}
                onChange={(e) => updateBreak(idx, "end", e.target.value)}
              />
            </div>

            {/* Row 3: Inline Error */}
            {breakErrors[brk.id] && (
              <div
                style={{
                  color: "var(--danger-color)",
                  fontSize: "0.875rem",
                  marginTop: "-0.25rem",
                  fontWeight: "500",
                }}
              >
                {breakErrors[brk.id]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HolidaysTab({
  settings,
  savingHolidays,
  saveHolidays,
  addHoliday,
  removeHoliday,
  updateHoliday,
  TODAY,
}) {
  return (
    <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <SettingsSectionHeader
        title="Holidays"
        itemName="Holiday"
        onAdd={addHoliday}
        onSave={saveHolidays}
        isSaving={savingHolidays}
      />

      {(!settings?.holidays || settings.holidays.length === 0) && (
        <div className="empty-state" style={{ padding: "2rem 1rem" }}>
          <p>No holidays configured.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {settings?.holidays?.map((hol, idx) => (
          <div
            key={hol.id || `hol-${idx}`}
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              padding: "1rem",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <input
              type="date"
              className="form-input"
              style={{ padding: "0.4rem", flex: 1 }}
              min={TODAY}
              value={hol.date}
              onChange={(e) => updateHoliday(idx, "date", e.target.value)}
            />
            <input
              type="text"
              className="form-input"
              style={{ padding: "0.4rem", flex: 2 }}
              placeholder="Label (e.g. Christmas)"
              value={hol.label}
              onChange={(e) => updateHoliday(idx, "label", e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeHoliday(idx)}
              className="icon-btn danger"
              title="Remove Holiday"
              style={{ flexShrink: 0 }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Settings;
