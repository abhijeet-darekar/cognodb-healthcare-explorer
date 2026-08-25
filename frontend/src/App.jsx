import { useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:8080';

function App() {
  const [doctorName, setDoctorName] = useState('Dr. Rao');
  const [referralData, setReferralData] = useState([]);
  const [conditionData, setConditionData] = useState([]);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [loadingConditions, setLoadingConditions] = useState(false);
  const [error, setError] = useState('');

  const fetchReferralChain = async () => {
    if (!doctorName.trim()) {
      setError('Please enter a doctor name.');
      return;
    }

    setLoadingReferral(true);
    setError('');
    setReferralData([]);

    try {
      const res = await fetch(
          `${API_BASE}/api/referral-chain?doctorName=${encodeURIComponent(doctorName)}`
      );

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setReferralData(data);

      if (data.length === 0) {
        setError(`No referral chain found for "${doctorName}".`);
      }
    } catch (err) {
      setError(
          'Unable to connect to the healthcare backend. Make sure Spring Boot is running on port 8080.'
      );
    } finally {
      setLoadingReferral(false);
    }
  };

  const fetchConditionNetwork = async () => {
    setLoadingConditions(true);
    setError('');
    setConditionData([]);

    try {
      const res = await fetch(`${API_BASE}/api/condition-hospital-network`);

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setConditionData(data);
    } catch (err) {
      setError(
          'Unable to connect to the healthcare backend. Make sure Spring Boot is running on port 8080.'
      );
    } finally {
      setLoadingConditions(false);
    }
  };

  return (
      <div className="app">
        <header className="hero">
          <div className="hero-badge">GRAPH-POWERED HEALTHCARE</div>

          <h1>Healthcare Relationship Explorer</h1>

          <p>
            Explore doctor referral chains and discover how healthcare
            conditions connect patients, doctors, and hospitals.
          </p>
        </header>

        {error && (
            <div className="error-message">
              {error}
            </div>
        )}

        <main className="dashboard">

          {/* Referral Section */}
          <section className="card">
            <div className="card-header">
              <div>
                <span className="section-label">RELATIONSHIP NETWORK</span>
                <h2>Doctor Referral Chain</h2>
                <p>
                  Follow referrals across multiple doctors and hospitals.
                </p>
              </div>

              <div className="icon-circle">↗</div>
            </div>

            <div className="search-row">
              <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchReferralChain();
                    }
                  }}
                  placeholder="Enter doctor name"
              />

              <button
                  onClick={fetchReferralChain}
                  disabled={loadingReferral}
              >
                {loadingReferral ? 'Searching...' : 'Search'}
              </button>
            </div>

            {loadingReferral && (
                <div className="loading">
                  <div className="spinner"></div>
                  Finding referral relationships...
                </div>
            )}

            {!loadingReferral && referralData.length === 0 && !error && (
                <div className="empty-state">
                  <div className="empty-icon">⌕</div>
                  <h3>No referral chain loaded</h3>
                  <p>
                    Enter a doctor's name and search to explore their referral
                    network.
                  </p>
                </div>
            )}

            {!loadingReferral && referralData.length > 0 && (
                <div className="results">
                  <div className="result-count">
                    {referralData.length} doctor
                    {referralData.length !== 1 ? 's' : ''} found
                  </div>

                  {referralData.map((item, idx) => (
                      <div className="doctor-result" key={idx}>
                        <div className="step-number">{idx + 1}</div>

                        <div className="doctor-info">
                          <strong>{item.doctor}</strong>
                          <span>{item.specialty}</span>
                        </div>

                        <div className="hospital">
                          <span>Hospital</span>
                          {item.hospital}
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </section>

          {/* Condition Section */}
          <section className="card">
            <div className="card-header">
              <div>
                <span className="section-label">GRAPH ANALYSIS</span>
                <h2>Condition → Hospital Network</h2>
                <p>
                  See how diagnosed conditions connect patients to hospitals.
                </p>
              </div>

              <div className="icon-circle">⌘</div>
            </div>

            <button
                className="secondary-button"
                onClick={fetchConditionNetwork}
                disabled={loadingConditions}
            >
              {loadingConditions ? 'Loading...' : 'Load Network'}
            </button>

            {loadingConditions && (
                <div className="loading">
                  <div className="spinner"></div>
                  Loading healthcare network...
                </div>
            )}

            {!loadingConditions && conditionData.length === 0 && !error && (
                <div className="empty-state">
                  <div className="empty-icon">⌁</div>
                  <h3>No network data loaded</h3>
                  <p>
                    Click "Load Network" to explore condition and hospital
                    relationships.
                  </p>
                </div>
            )}

            {!loadingConditions && conditionData.length > 0 && (
                <div className="table-wrapper">
                  <table>
                    <thead>
                    <tr>
                      <th>Condition</th>
                      <th>Hospital</th>
                      <th>Patients</th>
                    </tr>
                    </thead>

                    <tbody>
                    {conditionData.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                        <span className="condition">
                          {item.condition}
                        </span>
                          </td>

                          <td>{item.hospital}</td>

                          <td>
                        <span className="patient-count">
                          {item.patientCount}
                        </span>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}
          </section>

        </main>

        <footer>
          <span>Powered by CognoDB</span>
          <span>Graph Database Healthcare Explorer</span>
        </footer>
      </div>
  );
}

export default App;
