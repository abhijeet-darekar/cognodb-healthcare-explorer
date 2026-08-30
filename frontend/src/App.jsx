import { useEffect, useState } from "react";
import "./App.css";

const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function App() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [relationship, setRelationship] = useState(null);

  const [doctorName, setDoctorName] = useState("Dr. Mehta");
  const [referralChain, setReferralChain] = useState([]);
  const [loadingReferral, setLoadingReferral] = useState(false);

  const [conditionNetwork, setConditionNetwork] = useState([]);
  const [loadingNetwork, setLoadingNetwork] = useState(false);

  const [selectedNode, setSelectedNode] = useState("patient");

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingRelationship, setLoadingRelationship] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatients = async () => {
      setLoadingPatients(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE}/patients`);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        setPatients(data || []);

        if (data && data.length > 0) {
          setSelectedPatient(data[0].name);
        }
      } catch (err) {
        console.error(err);
        setError(
            "Unable to connect to the healthcare database. Please make sure the backend is running."
        );
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, []);

  const explorePatient = async () => {
    if (!selectedPatient) {
      setError("Please select a patient.");
      return;
    }

    setLoadingRelationship(true);
    setError("");
    setRelationship(null);
    setSelectedNode("patient");

    try {
      const response = await fetch(
          `${API_BASE}/api/patient-relationship?patientName=${encodeURIComponent(
              selectedPatient
          )}`
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.found) {
        setError(`No relationship data found for "${selectedPatient}".`);
        return;
      }

      setRelationship(data);
    } catch (err) {
      console.error(err);
      setError(
          "Unable to load the patient's relationship graph. Please try again."
      );
    } finally {
      setLoadingRelationship(false);
    }
  };

  const searchReferralChain = async () => {
    if (!doctorName.trim()) {
      setError("Please enter a doctor name.");
      return;
    }

    setLoadingReferral(true);
    setError("");
    setReferralChain([]);

    try {
      const response = await fetch(
          `${API_BASE}/api/referral-chain?doctorName=${encodeURIComponent(
              doctorName
          )}`
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setReferralChain(data || []);

      if (!data || data.length === 0) {
        setError(`No referral chain found for "${doctorName}".`);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load the doctor referral chain.");
    } finally {
      setLoadingReferral(false);
    }
  };

  const loadConditionNetwork = async () => {
    setLoadingNetwork(true);
    setError("");

    try {
      const response = await fetch(
          `${API_BASE}/api/condition-hospital-network`
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setConditionNetwork(data || []);

      if (!data || data.length === 0) {
        setError("No condition-hospital network data was found.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load the condition-hospital network.");
    } finally {
      setLoadingNetwork(false);
    }
  };

  const nodeData = {
    patient: relationship?.patient,
    condition: relationship?.condition,
    treatment: relationship?.treatment,
    provider: relationship?.provider,
    hospital: relationship?.hospital,
  };

  const showNodeDetails = (node) => {
    setSelectedNode(node);
  };

  const renderDetails = () => {
    if (!relationship) {
      return (
          <div className="empty-state">
            <div className="empty-icon">⌁</div>
            <h3>Explore the healthcare graph</h3>
            <p>
              Select a patient and click Explore to traverse the connected
              healthcare relationships.
            </p>
          </div>
      );
    }

    const data = nodeData[selectedNode];

    if (!data) {
      return (
          <div className="empty-state">
            <h3>No details available</h3>
            <p>This relationship does not contain additional information.</p>
          </div>
      );
    }

    if (selectedNode === "patient") {
      return (
          <div className="node-details">
            <span className="section-label">SELECTED NODE</span>
            <h3>Patient</h3>

            <div className="detail-grid">
              <div className="detail-item">
                <span>Name</span>
                <strong>{data.name}</strong>
              </div>

              <div className="detail-item">
                <span>Age</span>
                <strong>{data.age} years</strong>
              </div>

              <div className="detail-item">
                <span>Gender</span>
                <strong>{data.gender}</strong>
              </div>
            </div>
          </div>
      );
    }

    if (selectedNode === "condition") {
      return (
          <div className="node-details">
            <span className="section-label">SELECTED NODE</span>
            <h3>Condition</h3>

            <div className="detail-grid">
              <div className="detail-item">
                <span>Name</span>
                <strong>{data.name}</strong>
              </div>

              <div className="detail-item">
                <span>Category</span>
                <strong>{data.category}</strong>
              </div>
            </div>

            <p className="relationship-description">
              Patient is diagnosed with this condition.
            </p>
          </div>
      );
    }

    if (selectedNode === "treatment") {
      return (
          <div className="node-details">
            <span className="section-label">SELECTED NODE</span>
            <h3>Treatment</h3>

            <div className="detail-grid">
              <div className="detail-item">
                <span>Treatment</span>
                <strong>{data.name}</strong>
              </div>

              <div className="detail-item">
                <span>Date</span>
                <strong>{data.date}</strong>
              </div>
            </div>

            <p className="relationship-description">
              Patient received this treatment for the selected condition.
            </p>
          </div>
      );
    }

    if (selectedNode === "provider") {
      return (
          <div className="node-details">
            <span className="section-label">SELECTED NODE</span>
            <h3>Provider</h3>

            <div className="detail-grid">
              <div className="detail-item">
                <span>Name</span>
                <strong>{data.name}</strong>
              </div>

              <div className="detail-item">
                <span>Specialty</span>
                <strong>{data.specialty}</strong>
              </div>
            </div>

            <p className="relationship-description">
              Patient is treated by this healthcare provider.
            </p>
          </div>
      );
    }

    if (selectedNode === "hospital") {
      return (
          <div className="node-details">
            <span className="section-label">SELECTED NODE</span>
            <h3>Hospital</h3>

            <div className="detail-grid">
              <div className="detail-item">
                <span>Hospital</span>
                <strong>{data.name}</strong>
              </div>

              <div className="detail-item">
                <span>City</span>
                <strong>{data.city}</strong>
              </div>
            </div>

            <p className="relationship-description">
              The healthcare provider works at this hospital.
            </p>
          </div>
      );
    }

    return null;
  };

  const GraphNode = ({ type, label, relationshipLabel }) => {
    const isActive = selectedNode === type;

    return (
        <button
            type="button"
            className={`graph-node ${isActive ? "active" : ""}`}
            onClick={() => showNodeDetails(type)}
            disabled={!relationship || !nodeData[type]}
        >
          <span>{label}</span>
          <strong>{relationshipLabel}</strong>
        </button>
    );
  };

  return (
      <div className="app">
        <header className="hero">
          <div className="hero-badge">COGNODB • GRAPH HEALTHCARE</div>

          <h1>Healthcare Relationship Explorer</h1>

          <p>
            Explore how patients, doctors, conditions, treatments, healthcare
            providers, and hospitals are connected through a graph database.
          </p>
        </header>

        <main className="dashboard">

          {/* Patient Explorer */}
          <section className="card">
            <div className="card-header">
              <div>
                <span className="section-label">GRAPH EXPLORER</span>

                <h2>Explore Patient Relationships</h2>

                <p>
                  Select a patient to discover their complete healthcare
                  relationship path in CognoDB.
                </p>
              </div>

              <div className="icon-circle">⌕</div>
            </div>

            <div className="search-row">
              <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  disabled={loadingPatients || loadingRelationship}
              >
                {loadingPatients ? (
                    <option value="">Loading patients...</option>
                ) : (
                    <>
                      <option value="">Select a patient</option>

                      {patients.map((patient) => (
                          <option key={patient.name} value={patient.name}>
                            {patient.name} — {patient.age} years
                          </option>
                      ))}
                    </>
                )}
              </select>

              <button
                  onClick={explorePatient}
                  disabled={!selectedPatient || loadingRelationship}
              >
                {loadingRelationship ? "Exploring..." : "Explore"}
              </button>
            </div>

            {loadingRelationship && (
                <div className="loading">
                  <div className="spinner"></div>
                  Traversing healthcare relationships...
                </div>
            )}

            {!loadingRelationship && relationship && (
                <>
                  <div className="selected-patient">
                    <span>Selected:</span>
                    <strong>{relationship.patient?.name}</strong>
                  </div>

                  <div className="graph-path">
                    <GraphNode
                        type="patient"
                        label="Patient"
                        relationshipLabel="SELECTED"
                    />

                    <div className="graph-arrow">→</div>

                    <GraphNode
                        type="condition"
                        label="Condition"
                        relationshipLabel="DIAGNOSED_WITH"
                    />

                    <div className="graph-arrow">→</div>

                    <GraphNode
                        type="treatment"
                        label="Treatment"
                        relationshipLabel="RECEIVED"
                    />

                    <div className="graph-arrow">→</div>

                    <GraphNode
                        type="provider"
                        label="Provider"
                        relationshipLabel="TREATED_BY"
                    />

                    <div className="graph-arrow">→</div>

                    <GraphNode
                        type="hospital"
                        label="Hospital"
                        relationshipLabel="WORKS_AT"
                    />
                  </div>

                  <div className="relationship-details">
                    {renderDetails()}
                  </div>
                </>
            )}

            {!loadingRelationship && !relationship && !error && (
                <div className="empty-state">
                  <div className="empty-icon">⌁</div>

                  <h3>Explore the healthcare graph</h3>

                  <p>
                    Select a patient above to discover their connected condition,
                    treatment, provider, and hospital.
                  </p>
                </div>
            )}
          </section>

          {/* Doctor Referral Chain */}
          <section className="card">
            <div className="card-header">
              <div>
                <span className="section-label">DOCTOR NETWORK</span>

                <h2>Doctor Referral Chain</h2>

                <p>
                  Follow referral relationships from one doctor to connected
                  doctors and their hospitals.
                </p>
              </div>

              <div className="icon-circle">↗</div>
            </div>

            <div className="search-row">
              <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Enter doctor name"
                  disabled={loadingReferral}
              />

              <button
                  onClick={searchReferralChain}
                  disabled={loadingReferral}
              >
                {loadingReferral ? "Searching..." : "Search"}
              </button>
            </div>

            {referralChain.length > 0 && (
                <div className="results-list">
                  {referralChain.map((doctor, index) => (
                      <div className="result-item" key={`${doctor.doctor}-${index}`}>
                        <div>
                          <strong>{doctor.doctor}</strong>
                          <span>{doctor.specialty}</span>
                        </div>

                        <div>
                          <span>Hospital</span>
                          <strong>{doctor.hospital}</strong>
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {!loadingReferral && referralChain.length === 0 && (
                <div className="empty-state">
                  <h3>Search a doctor</h3>
                  <p>
                    Try <strong>Dr. Mehta</strong> to explore the seeded referral
                    relationship.
                  </p>
                </div>
            )}
          </section>

          {/* Condition Hospital Network */}
          <section className="card">
            <div className="card-header">
              <div>
                <span className="section-label">HEALTHCARE NETWORK</span>

                <h2>Condition → Hospital Network</h2>

                <p>
                  Discover which hospitals are associated with patients
                  diagnosed with each condition.
                </p>
              </div>

              <div className="icon-circle">⌘</div>
            </div>

            <button
                className="load-button"
                onClick={loadConditionNetwork}
                disabled={loadingNetwork}
            >
              {loadingNetwork ? "Loading..." : "Load Data"}
            </button>

            {conditionNetwork.length > 0 && (
                <div className="results-list">
                  {conditionNetwork.map((item, index) => (
                      <div
                          className="result-item"
                          key={`${item.condition}-${item.hospital}-${index}`}
                      >
                        <div>
                          <strong>{item.condition}</strong>
                          <span>Condition</span>
                        </div>

                        <div>
                          <span>Hospital</span>
                          <strong>{item.hospital}</strong>
                        </div>

                        <div>
                          <span>Patients</span>
                          <strong>{item.patientCount}</strong>
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {!loadingNetwork && conditionNetwork.length === 0 && (
                <div className="empty-state">
                  <h3>Load the healthcare network</h3>
                  <p>
                    Click <strong>Load Data</strong> to view conditions,
                    hospitals, and patient counts.
                  </p>
                </div>
            )}
          </section>

          {/* Graph Explanation */}
          <section className="card graph-card">
            <div className="card-header">
              <div>
                <span className="section-label">GRAPH TRAVERSAL</span>

                <h2>Why This Is a Graph Query</h2>

                <p>
                  The application follows relationships between connected
                  entities instead of joining multiple relational tables.
                </p>
              </div>

              <div className="icon-circle">◎</div>
            </div>

            <div className="traversal-list">
              <div className="traversal-item">
                <div className="step-number">1</div>

                <div>
                  <strong>Patient → Condition</strong>
                  <span>DIAGNOSED_WITH</span>
                </div>
              </div>

              <div className="traversal-item">
                <div className="step-number">2</div>

                <div>
                  <strong>Patient → Provider</strong>
                  <span>TREATED_BY</span>
                </div>
              </div>

              <div className="traversal-item">
                <div className="step-number">3</div>

                <div>
                  <strong>Provider → Hospital</strong>
                  <span>WORKS_AT</span>
                </div>
              </div>

              <div className="traversal-item">
                <div className="step-number">4</div>

                <div>
                  <strong>Doctor → Doctor</strong>
                  <span>REFERRED_TO</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {error && <div className="error-message">{error}</div>}

        <footer>
          <span>Powered by CognoDB</span>
          <span>Healthcare Relationship Explorer</span>
        </footer>
      </div>
  );
}

export default App;
