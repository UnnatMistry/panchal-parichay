import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import { searchFilterConfig } from './searchFilterConfig'
import { candidateData } from './candidateData'
import { loginCredentials } from './loginCredentials'

const ROWS_PER_PAGE = 10
const SAVED_LOGIN_KEY = 'pp-saved-login'
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000
const SITE_DISCLAIMER_TEXT =
  'This Site is only for your personal use. You may not use, distribute, exchange, modify, sell or transmit any materials you copy from this Site, including but not limited to any software, text, images, for any business, commercial or public purpose. All Materials on this Site are copyrighted and are protected by worldwide copyright laws and treaty provisions. Any unauthorized use of the Materials may violate copyright laws, trademark laws, the laws of privacy and publicity, and civil and criminal statutes.'

const doesAgeMatch = (candidateAge, selectedRange) => {
  if (!selectedRange) {
    return true
  }

  if (selectedRange === '50 or above') {
    return candidateAge >= 50
  }

  const [minAge, maxAge] = selectedRange.split('-').map(Number)
  return candidateAge >= minAge && candidateAge <= maxAge
}

function App() {
  const vishwakarmaImageUrl = `${import.meta.env.BASE_URL}vishwakarma-pic.jpeg`
  const siteLogoUrl = `${import.meta.env.BASE_URL}panchal-parichay-logo.svg`
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => window.sessionStorage.getItem('pp-authenticated') === 'true'
  )
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginSaveMessage, setLoginSaveMessage] = useState('')
  const [currentResultsPage, setCurrentResultsPage] = useState(1)
  const [resultsSearchTerm, setResultsSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    surname: '',
    gender: '',
    age: '',
    qualification: '',
    country: '',
  })

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    const isValidLogin = loginCredentials.some(
      (credential) =>
        credential.username === username.trim() && credential.password === password
    )

    if (isValidLogin) {
      setLoginError('')
      setIsAuthenticated(true)
      window.sessionStorage.setItem('pp-authenticated', 'true')
      navigate('/search', { replace: true })
      return
    }

    setLoginError('Invalid username or password.')
  }

  const handleSaveLoginDetails = () => {
    const trimmedUsername = username.trim()
    if (!trimmedUsername || !password) {
      setLoginSaveMessage('Enter username and password to save login details.')
      return
    }

    const payload = {
      username: trimmedUsername,
      password,
      expiresAt: Date.now() + THIRTY_DAYS_IN_MS,
    }
    window.localStorage.setItem(SAVED_LOGIN_KEY, JSON.stringify(payload))
    setLoginSaveMessage('Login details saved for 30 days on this browser.')
  }

  useEffect(() => {
    const cachedLogin = window.localStorage.getItem(SAVED_LOGIN_KEY)
    if (!cachedLogin) {
      return
    }

    try {
      const parsedLogin = JSON.parse(cachedLogin)
      if (
        !parsedLogin?.username ||
        !parsedLogin?.password ||
        typeof parsedLogin?.expiresAt !== 'number' ||
        parsedLogin.expiresAt < Date.now()
      ) {
        window.localStorage.removeItem(SAVED_LOGIN_KEY)
        return
      }

      setUsername(parsedLogin.username)
      setPassword(parsedLogin.password)
      setLoginSaveMessage('Saved login details loaded from browser cache.')
    } catch {
      window.localStorage.removeItem(SAVED_LOGIN_KEY)
    }
  }, [])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((previous) => ({ ...previous, [name]: value }))
  }

  const filteredCandidates = candidateData.filter((candidate) => {
    const matchesSurname =
      !filters.surname || candidate.aboutMe.surname === filters.surname
    const matchesGender = !filters.gender || candidate.gender === filters.gender
    const matchesAge = doesAgeMatch(candidate.aboutMe.age, filters.age)
    const matchesQualification =
      !filters.qualification ||
      candidate.aboutMe.qualification === filters.qualification
    const matchesCountry =
      !filters.country || candidate.contactAddress.country === filters.country

    return (
      matchesSurname &&
      matchesGender &&
      matchesAge &&
      matchesQualification &&
      matchesCountry
    )
  })
  const normalizedResultsSearchTerm = resultsSearchTerm.trim().toLowerCase()
  const searchableCandidates = filteredCandidates.filter((candidate) => {
    if (!normalizedResultsSearchTerm) {
      return true
    }

    const matchesId = candidate.id.toLowerCase().includes(normalizedResultsSearchTerm)
    const matchesFirstName = candidate.aboutMe.name
      .toLowerCase()
      .includes(normalizedResultsSearchTerm)

    return matchesId || matchesFirstName
  })

  const totalPages = Math.max(
    1,
    Math.ceil(searchableCandidates.length / ROWS_PER_PAGE)
  )
  const safeCurrentResultsPage = Math.min(currentResultsPage, totalPages)
  const startIndex = (safeCurrentResultsPage - 1) * ROWS_PER_PAGE
  const paginatedCandidates = searchableCandidates.slice(
    startIndex,
    startIndex + ROWS_PER_PAGE
  )
  const HomePage = () => (
    <div className="home-page">
      <header className="site-header">
        <img
          src={siteLogoUrl}
          alt="Panchal Parichay"
          className="site-logo"
        />
        <p>Trusted matrimony community for Panchal families.</p>
      </header>

      <nav className="top-links" aria-label="Main navigation">
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setLoginError('')
            setUsername('')
            setPassword('')
            navigate('/login')
          }}
        >
          Marriage Club
        </button>
        <a href="#contact-us">Contact Us</a>
      </nav>

      <main className="hero-section">
        <img
          src={vishwakarmaImageUrl}
          alt="Bhagwan Vishwakarma"
          className="center-image"
        />
      </main>

      <section id="marriage-club" className="info-card">
        <h2>Marriage Club</h2>
        <p>
          Join to find suitable matches, share family details, and connect with
          trusted Panchal members.
        </p>
      </section>

      <section id="contact-us" className="info-card">
        <h2>Contact Us</h2>
        <p>Email: contact@panchalparichay.in</p>
        <p>Phone: +91 98765 43210</p>
      </section>
    </div>
  )

  const LoginPage = () => (
    <div className="home-page">
      <header className="site-header">
        <h1>Marriage Club Login</h1>
        <p>Enter your details to continue.</p>
      </header>

      <form className="login-form" onSubmit={handleLoginSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value)
            setLoginError('')
            setLoginSaveMessage('')
          }}
          placeholder="Enter username"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            setLoginError('')
            setLoginSaveMessage('')
          }}
          placeholder="Enter password"
        />

        {loginError ? <p className="login-error">{loginError}</p> : null}
        {loginSaveMessage ? <p className="login-note">{loginSaveMessage}</p> : null}

        <button type="submit" className="primary-button">
          Login
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={handleSaveLoginDetails}
        >
          Save Login Details (30 days)
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setLoginError('')
            setLoginSaveMessage('')
            setUsername('')
            setPassword('')
            navigate('/')
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  )

  const SearchPage = () => (
    <div className="home-page">
      <header className="site-header">
        <h1>Search Profiles</h1>
        <p>Use filters to find matching profiles in Marriage Club.</p>
      </header>

      <form className="search-form">
        <div className="field-group">
          <label htmlFor="surname">Surname</label>
          <select
            id="surname"
            name="surname"
            value={filters.surname}
            onChange={handleFilterChange}
          >
            <option value="">Select surname</option>
            {searchFilterConfig.surname.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={filters.gender}
            onChange={handleFilterChange}
          >
            <option value="">Select gender</option>
            {searchFilterConfig.gender.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="age">Age</label>
          <select id="age" name="age" value={filters.age} onChange={handleFilterChange}>
            <option value="">Select age</option>
            {searchFilterConfig.age.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="qualification">Qualifications</label>
          <select
            id="qualification"
            name="qualification"
            value={filters.qualification}
            onChange={handleFilterChange}
          >
            <option value="">Select qualification</option>
            {searchFilterConfig.qualification.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="country">Country</label>
          <select
            id="country"
            name="country"
            value={filters.country}
            onChange={handleFilterChange}
          >
            <option value="">Select country</option>
            {searchFilterConfig.country.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setCurrentResultsPage(1)
            navigate('/results')
          }}
        >
          Search
        </button>
        <button type="button" className="secondary-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </form>
    </div>
  )

  const ResultsPage = () => (
    <div className="home-page">
      <header className="site-header">
        <h1>Candidate Biodata</h1>
        <p>
          Showing {searchableCandidates.length} candidate
          {searchableCandidates.length === 1 ? '' : 's'}.
        </p>
      </header>

      <section className="table-search-card">
        <label htmlFor="biodata-search">Search by first name or ID</label>
        <input
          id="biodata-search"
          type="text"
          value={resultsSearchTerm}
          onChange={(event) => {
            setResultsSearchTerm(event.target.value)
            setCurrentResultsPage(1)
          }}
          placeholder="Example: Harsh or PP001"
        />
      </section>

      <section className="table-card">
        <div className="table-wrapper">
          <table className="candidate-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>SURNAME</th>
                <th>NAME</th>
                <th>QUALIFICATION</th>
                <th>AGE</th>
                <th>CITY</th>
                <th>COUNTRY</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    No candidates found for selected filters.
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="clickable-row"
                    onClick={() => navigate(`/candidate/${candidate.id}`)}
                  >
                    <td>{candidate.id}</td>
                    <td>{candidate.aboutMe.surname}</td>
                    <td>{candidate.aboutMe.name}</td>
                    <td>{candidate.aboutMe.qualification}</td>
                    <td>{candidate.aboutMe.age}</td>
                    <td>{candidate.contactAddress.city}</td>
                    <td>{candidate.contactAddress.country}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="pagination-footer">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setCurrentResultsPage((previous) => Math.max(1, previous - 1))}
          disabled={safeCurrentResultsPage === 1}
        >
          Previous
        </button>
        <span>
          Page {safeCurrentResultsPage} of {totalPages}
        </span>
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            setCurrentResultsPage((previous) => Math.min(totalPages, previous + 1))
          }
          disabled={safeCurrentResultsPage === totalPages}
        >
          Next
        </button>
      </footer>

      <button type="button" className="secondary-button" onClick={() => navigate('/search')}>
        Back to Search
      </button>

      <section className="disclaimer-card">
        <p>{SITE_DISCLAIMER_TEXT}</p>
      </section>
    </div>
  )

  const DetailPage = () => {
    const { candidateId } = useParams()
    const [photoCandidateIndex, setPhotoCandidateIndex] = useState(0)
    const [isPhotoAvailable, setIsPhotoAvailable] = useState(true)

    const selectedCandidate = candidateData.find((candidate) => candidate.id === candidateId)
    const photoFilesToTry = selectedCandidate
      ? ['jpg', 'jpeg', 'png', 'webp'].flatMap((extension) => {
          const id = selectedCandidate.id
          const lowerCaseId = id.toLowerCase()
          return id === lowerCaseId
            ? [`${id}.${extension}`]
            : [`${id}.${extension}`, `${lowerCaseId}.${extension}`]
        })
      : []
    const selectedPhotoFile = photoFilesToTry[photoCandidateIndex]
    const selectedCandidatePhotoUrl = selectedPhotoFile
      ? `${import.meta.env.BASE_URL}candidate-photos/${selectedPhotoFile}`
      : ''

    useEffect(() => {
      setPhotoCandidateIndex(0)
      setIsPhotoAvailable(true)
    }, [candidateId])

    return (
      <div className="home-page">
        <header className="site-header">
          <h1>Candidate Biodata</h1>
          <p>Profile details for ID: {candidateId}</p>
        </header>

        {!selectedCandidate ? (
          <section className="info-card">
            <h2>Candidate not found</h2>
            <p>Selected profile is unavailable. Please go back to results.</p>
          </section>
        ) : (
          <>
            <section className="detail-card">
              <h2>Candidate Photo</h2>
              {isPhotoAvailable && selectedCandidatePhotoUrl ? (
                <img
                  src={selectedCandidatePhotoUrl}
                  alt={`${selectedCandidate.aboutMe.name} profile`}
                  className="candidate-photo"
                  onError={() => {
                    if (photoCandidateIndex < photoFilesToTry.length - 1) {
                      setPhotoCandidateIndex((previous) => previous + 1)
                    } else {
                      setIsPhotoAvailable(false)
                    }
                  }}
                />
              ) : (
                <p>Photo not available for this candidate.</p>
              )}
            </section>

            <section className="detail-card">
              <h2>About Me</h2>
              <dl className="detail-grid">
                <div>
                  <dt>D.O.B.</dt>
                  <dd>{selectedCandidate.moreDetails.dob}</dd>
                </div>
                <div>
                  <dt>ID</dt>
                  <dd>{selectedCandidate.id}</dd>
                </div>
                <div>
                  <dt>Surname</dt>
                  <dd>{selectedCandidate.aboutMe.surname}</dd>
                </div>
                <div>
                  <dt>Name</dt>
                  <dd>{selectedCandidate.aboutMe.name}</dd>
                </div>
                <div>
                  <dt>Age</dt>
                  <dd>{selectedCandidate.aboutMe.age}</dd>
                </div>
                <div>
                  <dt>Height</dt>
                  <dd>{selectedCandidate.aboutMe.height}</dd>
                </div>
                <div>
                  <dt>Weight</dt>
                  <dd>{selectedCandidate.aboutMe.weight}</dd>
                </div>
                <div>
                  <dt>Qualification</dt>
                  <dd>{selectedCandidate.aboutMe.qualification}</dd>
                </div>
                <div>
                  <dt>Stream</dt>
                  <dd>{selectedCandidate.aboutMe.stream}</dd>
                </div>
                <div>
                  <dt>Occupation</dt>
                  <dd>{selectedCandidate.aboutMe.occupation}</dd>
                </div>
                <div>
                  <dt>Income (Annual)</dt>
                  <dd>{selectedCandidate.aboutMe.incomeAnnual}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-card">
              <h2>About My Family</h2>
              <dl className="detail-grid">
                <div>
                  <dt>Native Place</dt>
                  <dd>{selectedCandidate.aboutMyFamily.nativePlace}</dd>
                </div>
                <div>
                  <dt>Father&apos;s Name</dt>
                  <dd>{selectedCandidate.aboutMyFamily.fatherName}</dd>
                </div>
                <div>
                  <dt>Father&apos;s Occupation</dt>
                  <dd>{selectedCandidate.aboutMyFamily.fatherOccupation}</dd>
                </div>
                <div>
                  <dt>Mother&apos;s Name</dt>
                  <dd>{selectedCandidate.aboutMyFamily.motherName}</dd>
                </div>
                <div>
                  <dt>Mother&apos;s Occupation</dt>
                  <dd>{selectedCandidate.aboutMyFamily.motherOccupation}</dd>
                </div>
                <div>
                  <dt>Brothers</dt>
                  <dd>{selectedCandidate.aboutMyFamily.brothers}</dd>
                </div>
                <div>
                  <dt>Sisters</dt>
                  <dd>{selectedCandidate.aboutMyFamily.sisters}</dd>
                </div>
                <div>
                  <dt>Income (Annual)</dt>
                  <dd>{selectedCandidate.aboutMyFamily.incomeAnnual}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-card">
              <h2>More Details</h2>
              <dl className="detail-grid">
                <div>
                  <dt>Birth Time</dt>
                  <dd>{selectedCandidate.moreDetails.birthTime}</dd>
                </div>
                <div>
                  <dt>Birth Place</dt>
                  <dd>{selectedCandidate.moreDetails.birthPlace}</dd>
                </div>
                <div>
                  <dt>Spect</dt>
                  <dd>{selectedCandidate.moreDetails.spect}</dd>
                </div>
                <div>
                  <dt>Mangal/Shani</dt>
                  <dd>{selectedCandidate.moreDetails.mangalShani}</dd>
                </div>
                <div>
                  <dt>Disability</dt>
                  <dd>{selectedCandidate.moreDetails.disability}</dd>
                </div>
                <div className="full-width">
                  <dt>More Details About Me And My Choice</dt>
                  <dd>{selectedCandidate.moreDetails.moreDetailsAboutMeAndMyChoice}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-card">
              <h2>Contact Address</h2>
              <dl className="detail-grid">
                <div>
                  <dt>Address</dt>
                  <dd>{selectedCandidate.contactAddress.address}</dd>
                </div>
                <div>
                  <dt>City</dt>
                  <dd>{selectedCandidate.contactAddress.city}</dd>
                </div>
                <div>
                  <dt>State</dt>
                  <dd>{selectedCandidate.contactAddress.state}</dd>
                </div>
                <div>
                  <dt>Country</dt>
                  <dd>{selectedCandidate.contactAddress.country}</dd>
                </div>
                <div>
                  <dt>Pincode</dt>
                  <dd>{selectedCandidate.contactAddress.pincode}</dd>
                </div>
                <div>
                  <dt>Phone/Mobile</dt>
                  <dd>{selectedCandidate.contactAddress.phoneMobile}</dd>
                </div>
                <div className="full-width">
                  <dt>Email</dt>
                  <dd>{selectedCandidate.contactAddress.email}</dd>
                </div>
              </dl>
            </section>
          </>
        )}

        <button type="button" className="secondary-button" onClick={() => navigate('/results')}>
          Back to Results
        </button>

        <section className="disclaimer-card">
          <p>{SITE_DISCLAIMER_TEXT}</p>
        </section>
      </div>
    )
  }

  const ProtectedRoute = ({ children }) => {
    const hasSessionAuth = window.sessionStorage.getItem('pp-authenticated') === 'true'
    if (!isAuthenticated && !hasSessionAuth) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  return (
    <Routes>
      <Route path="/" element={HomePage()} />
      <Route path="/login" element={LoginPage()} />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            {SearchPage()}
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute>
            {ResultsPage()}
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/:candidateId"
        element={
          <ProtectedRoute>
            <DetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
