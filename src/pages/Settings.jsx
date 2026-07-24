import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "/api/v1";

function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { token } = useAuth();

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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/admin/provider-settings/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          working_days: settings.working_days,
          working_hours_start: settings.working_hours_start,
          working_hours_end: settings.working_hours_end,
          timezone: settings.timezone,
          slot_duration_minutes: settings.slot_duration_minutes,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="card" style={{ padding: "2rem", maxWidth: "600px" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Provider Configuration</h2>

      {error && <div className="error-banner">{error}</div>}
      {success && (
        <div
          style={{
            background: "#ECFDF5",
            color: "#059669",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="settings-form">
        <div className="form-group">
          <label>Working Days (e.g. 0,1,2,3,4)</label>
          <input
            type="text"
            value={settings?.working_days || ""}
            onChange={(e) => setSettings({ ...settings, working_days: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Time (HH:MM)</label>
            <input
              type="time"
              value={settings?.working_hours_start || ""}
              onChange={(e) => setSettings({ ...settings, working_hours_start: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Time (HH:MM)</label>
            <input
              type="time"
              value={settings?.working_hours_end || ""}
              onChange={(e) => setSettings({ ...settings, working_hours_end: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Timezone</label>
            <input
              type="text"
              value={settings?.timezone || ""}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Slot Duration (mins)</label>
            <input
              type="number"
              value={settings?.slot_duration_minutes || 30}
              onChange={(e) =>
                setSettings({ ...settings, slot_duration_minutes: parseInt(e.target.value) })
              }
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
          <button type="button" className="btn-secondary" onClick={handleConnectGoogle}>
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Connect Google Calendar
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
