import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const companies = [
  { name: 'Accenture', mark: 'A', color: '#6d3dc7' },
  { name: 'Wipro', mark: 'W', color: '#7652c8' },
  { name: 'HCLTech', mark: 'H', color: '#0879c9' },
  { name: 'Infosys', mark: 'I', color: '#0876bd' },
  { name: 'Tata Consultancy Services', mark: 'T', color: '#3449a5' },
  { name: 'Cognizant', mark: 'C', color: '#174793' },
  { name: 'Capgemini', mark: 'C', color: '#1679b8' },
  { name: 'IBM', mark: 'IBM', color: '#2457a7' },
  { name: 'Tech Mahindra', mark: 'M', color: '#e04448' },
  { name: 'Deloitte', mark: 'D', color: '#268542' },
]

const emptyForm = {
  name: '',
  studentId: '',
  department: '',
  year: '',
  section: '',
  bloodGroup: '',
  fatherName: '',
  motherName: '',
  phone: '',
  email: '',
  arrears: '0',
}

function CompanyMark({ company }) {
  return (
    <span className="company-mark" style={{ '--mark-color': company.color }} aria-hidden="true">
      {company.mark}
    </span>
  )
}

function App() {
  const [view, setView] = useState('student')
  const [step, setStep] = useState('details')
  const [form, setForm] = useState(emptyForm)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/students`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load student registrations.')
        setStudents(await response.json())
      })
      .catch(() => setApiError('Could not connect to the registration server.'))
      .finally(() => setStudentsLoading(false))
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function continueToCompanies(event) {
    event.preventDefault()
    if (Number(form.arrears) !== 0) {
      setNotice('Students with standing arrears are not eligible for placement registration.')
      return
    }
    setNotice('')
    setStep('companies')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleCompany(name) {
    setSelectedCompanies((current) => {
      if (current.includes(name)) return current.filter((company) => company !== name)
      if (current.length === 4) return current
      return [...current, name]
    })
  }

  async function submitRegistration() {
    const student = { ...form, companies: selectedCompanies, registeredAt: new Date().toISOString() }
    try {
      const response = await fetch(`${API_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      })
      const savedStudent = await response.json()
      if (!response.ok) throw new Error(savedStudent.message || 'Could not save the registration.')

      setStudents((current) => [
        savedStudent,
        ...current.filter((item) => item.studentId.toLowerCase() !== savedStudent.studentId.toLowerCase()),
      ])
      setApiError('')
      setStep('complete')
      setNotice('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setNotice(error.message || 'Could not connect to the registration server.')
    }
  }

  function startOver() {
    setForm(emptyForm)
    setSelectedCompanies([])
    setStep('details')
  }

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.studentId} ${student.department}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark">P<span>.</span></span>
          <span className="brand-copy"><strong>Pathway</strong><small>Campus placements</small></span>
        </a>
        <div className="topbar-right">
          <span className="academic-year">ACADEMIC YEAR <b>2025 / 26</b></span>
          <div className="view-switch" role="tablist" aria-label="Portal view">
            <button className={view === 'student' ? 'active' : ''} role="tab" aria-selected={view === 'student'} onClick={() => setView('student')}>Student portal</button>
            <button className={view === 'admin' ? 'active' : ''} role="tab" aria-selected={view === 'admin'} onClick={() => setView('admin')}>Admin view</button>
          </div>
        </div>
      </header>

      <main id="home">
        {view === 'student' ? (
          <>
            <section className="page-intro">
              <div>
                <p className="eyebrow"><span className="eyebrow-line" /> PLACEMENT CELL <span className="eyebrow-dot">/</span> STUDENT REGISTRATION</p>
                <h1>Your next chapter<br /><em>starts here.</em></h1>
                <p className="intro-copy">Complete your profile to be considered for campus recruitment opportunities.</p>
              </div>
              <div className="intake-note"><span className="note-star">✳</span><div><strong>Class of 2026</strong><span>Registration is now open</span></div></div>
            </section>

            <section className="registration-layout" aria-label="Student placement registration">
              <aside className="steps-panel">
                <p className="section-kicker">YOUR APPLICATION</p>
                <div className={`step-item ${step === 'details' ? 'current' : 'done'}`}>
                  <span className="step-number">{step === 'details' ? '01' : '✓'}</span>
                  <div><strong>Student details</strong><small>Personal & academic profile</small></div>
                </div>
                <div className={`step-item ${step === 'companies' ? 'current' : ''} ${step === 'complete' ? 'done' : ''}`}>
                  <span className="step-number">{step === 'complete' ? '✓' : '02'}</span>
                  <div><strong>Company preferences</strong><small>Choose up to four companies</small></div>
                </div>
                <div className={`step-item ${step === 'complete' ? 'current done' : ''}`}>
                  <span className="step-number">03</span>
                  <div><strong>Registration complete</strong><small>You're on your way</small></div>
                </div>
                <div className="eligibility-note"><span className="eligibility-icon">i</span><p><strong>Placement eligibility</strong><br />Students must have <b>zero standing arrears</b> to continue.</p></div>
                <div className="steps-footer">NEED HELP? <a href="mailto:placement@college.edu">Contact the placement cell</a></div>
              </aside>

              <div className="form-panel">
                {step === 'details' && (
                  <>
                    <div className="panel-heading"><div><p className="section-kicker">STEP 01 <span>/</span> YOUR PROFILE</p><h2>Tell us about yourself</h2><p className="panel-subtitle">Use the details recorded with your institution.</p></div><span className="required-note"><b>*</b> Required fields</span></div>
                    {notice && <div className="form-notice" role="alert">{notice}</div>}
                    <form onSubmit={continueToCompanies}>
                      <div className="form-section-title"><span>01</span><h3>Personal information</h3><i /></div>
                      <div className="form-grid">
                        <label className="field field-wide">Student name <b>*</b><input name="name" value={form.name} onChange={updateField} placeholder="e.g. Aanya Sharma" autoComplete="name" required /></label>
                        <label className="field">Student ID <b>*</b><input name="studentId" value={form.studentId} onChange={updateField} placeholder="e.g. 22CS014" required /></label>
                        <label className="field">Department <b>*</b><select name="department" value={form.department} onChange={updateField} required><option value="">Select department</option><option>Computer Science</option><option>Information Technology</option><option>Electronics & Communication</option><option>Electrical Engineering</option><option>Mechanical Engineering</option><option>Civil Engineering</option><option>Business Administration</option><option>Other</option></select></label>
                        <label className="field">Year of study <b>*</b><select name="year" value={form.year} onChange={updateField} required><option value="">Select year</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option></select></label>
                        <label className="field">Section <b>*</b><input name="section" value={form.section} onChange={updateField} placeholder="e.g. A" required /></label>
                        <label className="field">Blood group <b>*</b><select name="bloodGroup" value={form.bloodGroup} onChange={updateField} required><option value="">Select blood group</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group}>{group}</option>)}</select></label>
                      </div>

                      <div className="form-section-title family-title"><span>02</span><h3>Family & contact</h3><i /></div>
                      <div className="form-grid">
                        <label className="field">Father's name <b>*</b><input name="fatherName" value={form.fatherName} onChange={updateField} placeholder="Full name" required /></label>
                        <label className="field">Mother's name <b>*</b><input name="motherName" value={form.motherName} onChange={updateField} placeholder="Full name" required /></label>
                        <label className="field">Phone number <b>*</b><input name="phone" value={form.phone} onChange={updateField} placeholder="10-digit mobile number" type="tel" pattern="[0-9+() -]{8,18}" autoComplete="tel" required /></label>
                        <label className="field">Email address <b>*</b><input name="email" value={form.email} onChange={updateField} placeholder="you@example.com" type="email" autoComplete="email" required /></label>
                      </div>

                      <div className="arrears-block">
                        <div><strong>Standing arrears</strong><span>Enter the number of uncleared subjects.</span></div>
                        <label className="field arrears-field"><span className="sr-only">Number of standing arrears</span><input name="arrears" value={form.arrears} onChange={updateField} type="number" min="0" step="1" required /></label>
                      </div>
                      <div className="form-actions"><span>All information is kept with your placement profile.</span><button className="button button-primary" type="submit">Continue to companies <span aria-hidden="true">→</span></button></div>
                    </form>
                  </>
                )}

                {step === 'companies' && (
                  <>
                    <div className="panel-heading"><div><p className="section-kicker">STEP 02 <span>/</span> COMPANY PREFERENCES</p><h2>Choose your four</h2><p className="panel-subtitle">Select exactly four companies you would like to be considered for.</p></div><span className="selection-count"><b>{selectedCompanies.length}</b> / 4 selected</span></div>
                    <div className="company-grid">{companies.map((company, index) => <button type="button" key={company.name} className={`company-option ${selectedCompanies.includes(company.name) ? 'selected' : ''}`} onClick={() => toggleCompany(company.name)} aria-pressed={selectedCompanies.includes(company.name)}><CompanyMark company={company} /><span className="company-name">{company.name}</span><span className="company-index">{String(index + 1).padStart(2, '0')}</span><span className="check-mark" aria-hidden="true">{selectedCompanies.includes(company.name) ? '✓' : '+'}</span></button>)}</div>
                    {notice && <div className="form-notice" role="alert">{notice}</div>}
                    <div className="preference-footer"><button className="button button-quiet" type="button" onClick={() => { setStep('details'); setNotice('') }}>← Back to details</button><button className="button button-primary" type="button" disabled={selectedCompanies.length !== 4} onClick={submitRegistration}>Submit registration <span aria-hidden="true">→</span></button></div>
                    <p className="preference-footnote">Your preferences are final once submitted. You can update them by registering again with the same student ID.</p>
                  </>
                )}

                {step === 'complete' && (
                  <div className="completion-state"><span className="completion-icon">✓</span><p className="section-kicker">APPLICATION RECEIVED</p><h2>You're on the list, {form.name.split(' ')[0]}.</h2><p>Your placement profile is registered. We’ll use your selected companies to match upcoming opportunities.</p><div className="completion-companies">{selectedCompanies.map((name) => { const company = companies.find((item) => item.name === name); return <span className="completion-company" key={name}><CompanyMark company={company} />{name}</span> })}</div><button className="button button-quiet" type="button" onClick={startOver}>Register another student <span aria-hidden="true">→</span></button></div>
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="admin-page">
            <div className="admin-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> PLACEMENT CELL <span className="eyebrow-dot">/</span> ADMINISTRATION</p><h1>Applicant <em>directory.</em></h1><p className="intro-copy">Review registered students by company preference.</p></div><div className="admin-total"><strong>{students.length.toString().padStart(2, '0')}</strong><span>STUDENTS REGISTERED</span></div></div>
            <div className="admin-toolbar"><div className="admin-toolbar-label"><span className="section-kicker">COMPANY-WISE ROSTER</span><span>{studentsLoading ? 'Loading registrations...' : `${companies.length} participating companies`}</span></div><label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search students" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, ID or department" /></label></div>
            {apiError && <p className="form-notice" role="alert">{apiError}</p>}
            <div className="company-roster">{companies.map((company, index) => {
              const applicants = filteredStudents.filter((student) => student.companies.includes(company.name))
              return <section className="roster-company" key={company.name}><div className="roster-heading"><div className="roster-company-name"><CompanyMark company={company} /><div><span className="roster-index">COMPANY {String(index + 1).padStart(2, '0')}</span><h2>{company.name}</h2></div></div><span className="applicant-count">{applicants.length} {applicants.length === 1 ? 'applicant' : 'applicants'}</span></div>{applicants.length ? <div className="roster-table-wrap"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>DEPARTMENT</th><th>YEAR / SEC</th><th>EMAIL</th><th>PHONE</th></tr></thead><tbody>{applicants.map((student) => <tr key={student.studentId}><td className="student-cell">{student.name}</td><td>{student.studentId}</td><td>{student.department}</td><td>{student.year} / {student.section}</td><td>{student.email}</td><td>{student.phone}</td></tr>)}</tbody></table></div> : <p className="empty-roster">No registered students have selected this company.</p>}</section>
            })}</div>
            <p className="admin-disclaimer">Student registrations are stored in the connected MongoDB database.</p>
          </section>
        )}
      </main>
      <footer className="site-footer"><span>PATHWAY <b>·</b> PLACEMENT CELL</span><span>Building tomorrow, one opportunity at a time.</span></footer>
    </div>
  )
}

export default App
