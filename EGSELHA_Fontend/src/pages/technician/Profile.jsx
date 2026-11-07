import { Check, Camera, Star, ShieldCheck, Award, CheckCircle2, BriefcaseBusiness } from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import { useTech } from '../../context/TechnicianContext'
import { technicianApi } from '../../services/technicianApi'

export default function Profile() {
  const { profile, setProfile, photoPreview, setPhotoPreview, updateProfile } = useTech()
  const change = (e) => setProfile({ ...profile, [e.target.name]: e.target.value })
  const initials = profile?.name
    ? profile.name.split(' ').map((x) => x[0]).join('').slice(0, 2)
    : ''

  const handleSave = async () => {
    await updateProfile(profile)
  }

  if (!profile) return <div className="empty-state"><p>Loading profile…</p></div>

  return (
    <>
      <PageTitle
        eyebrow="ACCOUNT / PERSONAL DETAILS"
        title="My Profile"
        desc="Manage your personal information and technician details."
        action={
          <button className="btn primary" onClick={handleSave}>
            <Check size={16} /> Save changes
          </button>
        }
      />

      <div className="profile-grid">
        <section className="panel profile-card">
          <div className="profile-cover" />
          <div className="profile-identity">
            <label className="profile-photo">
              {photoPreview ? <img src={photoPreview} alt="" /> : <span>{initials}</span>}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setPhotoPreview(URL.createObjectURL(f))
                }}
              />
              <i><Camera size={13} /></i>
            </label>
            <div>
              <h2 className='profile-name text-white'>{profile.name}</h2>
              <p>Verified Technician <ShieldCheck size={15} /></p>
              <div className="profile-rating">
                <Star size={14} fill="currentColor" /> {profile.rating ?? 4.9}{' '}
                <span>· {profile.reviewCount ?? 0} customer reviews</span>
              </div>
            </div>
          </div>

          <div className="profile-badges">
            <span><Award /> Top Rated</span>
            <span><CheckCircle2 /> Identity verified</span>
            <span><BriefcaseBusiness /> {profile.jobsDone ?? 0} jobs done</span>
          </div>

          <div className="profile-about">
            <h3>About me</h3>
            <p>{profile.bio}</p>
          </div>
        </section>

        <section className="panel edit-profile">
          <div className="panel-head">
            <div><h2>Personal information</h2><p>Keep your details up to date.</p></div>
          </div>
          <div className="form-grid">
            <label className="field wide">Full name<input name="name" value={profile.name} onChange={change} /></label>
            <label className="field">Email address<input name="email" value={profile.email} onChange={change} /></label>
            <label className="field">Phone number<input name="phone" value={profile.phone} onChange={change} /></label>
            <label className="field wide">Service area<input name="area" value={profile.area} onChange={change} /></label>
            <label className="field wide">Short bio<textarea name="bio" value={profile.bio} onChange={change} /></label>
          </div>
          <button className="btn primary" onClick={handleSave}>Save profile</button>
        </section>
      </div>
    </>
  )
}
