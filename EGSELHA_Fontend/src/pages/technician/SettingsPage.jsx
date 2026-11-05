import { useEffect, useState } from 'react'
import { Check, Clock3, Bell, LockKeyhole, ChevronRight, X, Calendar } from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import Toggle from '../../component/Toggle'
import { useTech } from '../../context/TechnicianContext'
import { technicianApi } from '../../services/technicianApi'

const ALL_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

const TIME_OPTIONS = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  '08:00 PM', '09:00 PM', '10:00 PM'
]

export default function SettingsPage() {
  const { notify } = useTech()
  const [available, setAvailable] = useState(true)
  const [push, setPush] = useState(true)
  const [sms, setSms] = useState(false)
  const [email, setEmail] = useState(true)
  const [workingDays, setWorkingDays] = useState('Sunday – Thursday')
  const [workingHours, setWorkingHours] = useState('09:00 AM – 06:00 PM')
  const [loading, setLoading] = useState(true)

  // Modals state
  const [showDaysModal, setShowDaysModal] = useState(false)
  const [showHoursModal, setShowHoursModal] = useState(false)

  // Temp edit states
  const [selectedDays, setSelectedDays] = useState(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'])
  const [startHour, setStartHour] = useState('09:00 AM')
  const [endHour, setEndHour] = useState('06:00 PM')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await technicianApi.getSettings()
        if (data) {
          setAvailable(data.available ?? true)
          setPush(data.push ?? true)
          setSms(data.sms ?? false)
          setEmail(data.email ?? true)
          setWorkingDays(data.workingDays ?? 'Sunday – Thursday')
          setWorkingHours(data.workingHours ?? '09:00 AM – 06:00 PM')

          // Parse initial days if possible
          if (data.workingDays) {
            parseDaysString(data.workingDays)
          }
          if (data.workingHours && data.workingHours.includes('–')) {
            const parts = data.workingHours.split('–').map(s => s.trim())
            if (parts.length === 2) {
              setStartHour(parts[0])
              setEndHour(parts[1])
            }
          }
        }
      } catch (error) {
        console.error('Settings API Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const parseDaysString = (str) => {
    if (str.includes('–')) {
      const [start, end] = str.split('–').map(s => s.trim())
      const sIdx = ALL_DAYS.indexOf(start)
      const eIdx = ALL_DAYS.indexOf(end)
      if (sIdx !== -1 && eIdx !== -1) {
        if (sIdx <= eIdx) {
          setSelectedDays(ALL_DAYS.slice(sIdx, eIdx + 1))
        } else {
          setSelectedDays([...ALL_DAYS.slice(sIdx), ...ALL_DAYS.slice(0, eIdx + 1)])
        }
        return
      }
    }
    const matched = ALL_DAYS.filter(d => str.includes(d))
    if (matched.length > 0) setSelectedDays(matched)
  }

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) {
        notify('You must select at least one working day.')
        return
      }
      setSelectedDays(selectedDays.filter(d => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  const saveDays = async () => {
    // Generate text representation
    let text = ''
    const sorted = ALL_DAYS.filter(d => selectedDays.includes(d))
    if (sorted.length === 5 && sorted[0] === 'Sunday' && sorted[4] === 'Thursday') {
      text = 'Sunday – Thursday'
    } else if (sorted.length === 6 && sorted[0] === 'Saturday' && sorted[5] === 'Thursday') {
      text = 'Saturday – Thursday'
    } else if (sorted.length === 7) {
      text = 'Every day (Mon – Sun)'
    } else {
      text = sorted.join(', ')
    }

    setWorkingDays(text)
    setShowDaysModal(false)

    // Save to API
    try {
      await technicianApi.updateSettings({
        available,
        workingDays: text,
        workingHours,
        push,
        sms,
        email,
      })
      notify('Working days updated and saved.')
    } catch (err) {
      notify('Failed to save working days.')
    }
  }

  const saveHours = async () => {
    const text = `${startHour} – ${endHour}`
    setWorkingHours(text)
    setShowHoursModal(false)

    // Save to API
    try {
      await technicianApi.updateSettings({
        available,
        workingDays,
        workingHours: text,
        push,
        sms,
        email,
      })
      notify('Working hours updated and saved.')
    } catch (err) {
      notify('Failed to save working hours.')
    }
  }

  const handleSave = async () => {
    try {
      await technicianApi.updateSettings({
        available,
        workingDays,
        workingHours,
        push,
        sms,
        email,
      })
      notify('Settings saved successfully.')
    } catch (error) {
      console.error('Save settings error:', error)
      notify('Failed to save settings.')
    }
  }

  if (loading) {
    return <div className="empty-state"><p>Loading settings…</p></div>
  }

  return (
    <>
      <PageTitle
        eyebrow="ACCOUNT / PREFERENCES"
        title="Settings"
        desc="Control your availability, notifications and account security."
        action={
          <button className="btn primary" onClick={handleSave}>
            <Check size={16} /> Save settings
          </button>
        }
      />

      <div className="settings-grid">
        <section className="panel settings-panel">
          <div className="setting-heading">
            <div className="setting-icon"><Clock3 /></div>
            <div><h2>Work availability</h2><p>Let the system know when you can receive jobs.</p></div>
          </div>
          <div className="setting-row">
            <div><b>Available for new jobs</b><small>When turned off, you won't receive new assignments.</small></div>
            <Toggle value={available} onChange={setAvailable} />
          </div>
          <div className="setting-row">
            <div><b>Working days</b><small>{workingDays}</small></div>
            <button className="text-btn" onClick={() => setShowDaysModal(true)}>
              Edit <ChevronRight size={15} />
            </button>
          </div>
          <div className="setting-row">
            <div><b>Working hours</b><small>{workingHours}</small></div>
            <button className="text-btn" onClick={() => setShowHoursModal(true)}>
              Edit <ChevronRight size={15} />
            </button>
          </div>
        </section>

        <section className="panel settings-panel">
          <div className="setting-heading">
            <div className="setting-icon"><Bell /></div>
            <div><h2>Notifications</h2><p>Choose how you want to receive updates.</p></div>
          </div>
          <div className="setting-row">
            <div><b>Push notifications</b><small>New bookings and job updates.</small></div>
            <Toggle value={push} onChange={setPush} />
          </div>
          <div className="setting-row">
            <div><b>SMS notifications</b><small>Important alerts by text message.</small></div>
            <Toggle value={sms} onChange={setSms} />
          </div>
          <div className="setting-row">
            <div><b>Email notifications</b><small>Earnings summaries and account updates.</small></div>
            <Toggle value={email} onChange={setEmail} />
          </div>
        </section>

        <section className="panel settings-panel security-panel">
          <div className="setting-heading">
            <div className="setting-icon"><LockKeyhole /></div>
            <div><h2>Security</h2><p>Keep your account protected.</p></div>
          </div>
          <div className="setting-row">
            <div><b>Change password</b><small>Update your account password regularly.</small></div>
            <button className="btn outline" onClick={() => notify('Password change is managed by authentication provider.')}>
              Change password
            </button>
          </div>
          <div className="setting-row">
            <div><b>Two-factor authentication</b><small>Add an extra layer of security.</small></div>
            <button className="text-btn" onClick={() => notify('2FA security setup will be configured via SMS OTP.')}>
              Set up <ChevronRight size={15} />
            </button>
          </div>
        </section>
      </div>

      {/* Working Days Modal */}
      {showDaysModal && (
        <div className="modal-overlay" onClick={() => setShowDaysModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Edit Working Days</h3>
                <p>Select the days you are available to accept jobs</p>
              </div>
              <button className="icon-btn" onClick={() => setShowDaysModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <label className="field" style={{ marginBottom: 12 }}>Available Days</label>
              <div className="days-chips">
                {ALL_DAYS.map((day) => {
                  const active = selectedDays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      className={`day-chip ${active ? 'active' : ''}`}
                      onClick={() => toggleDay(day)}
                    >
                      {active && <Check size={14} />}
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn outline" onClick={() => setShowDaysModal(false)}>Cancel</button>
              <button className="btn primary" onClick={saveDays}>Apply & Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Working Hours Modal */}
      {showHoursModal && (
        <div className="modal-overlay" onClick={() => setShowHoursModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Edit Working Hours</h3>
                <p>Set your daily operational shift</p>
              </div>
              <button className="icon-btn" onClick={() => setShowHoursModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="hours-inputs">
                <div>
                  <label className="field" style={{ marginBottom: 8 }}>Start Shift</label>
                  <select
                    className="select-input"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field" style={{ marginBottom: 8 }}>End Shift</label>
                  <select
                    className="select-input"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn outline" onClick={() => setShowHoursModal(false)}>Cancel</button>
              <button className="btn primary" onClick={saveHours}>Apply & Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
