import { useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import "./App.css";

const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const NODE_COLORS = {
  patient: "#138a8a",
  condition: "#6366f1",
  treatment: "#e07a3f",
  provider: "#0f766e",
  hospital: "#2563eb",
};

function GraphNode({ data }) {
  return (
      <div
          style={{
            minWidth: 150,
            padding: "14px 16px",
            borderRadius: 14,
            border: `2px solid ${data.color}`,
            background: "#ffffff",
            boxShadow: "0 8px 22px rgba(24, 48, 72, 0.12)",
          }}
      >
        {data.source && <Handle type="target" position={Position.Left} />}
        <div
            style={{
              color: data.color,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1,
              marginBottom: 6,
            }}
        >
          {data.type.toUpperCase()}
        </div>
        <div
            style={{
              color: "#172033",
              fontSize: 15,
              fontWeight: 700,
            }}
        >
          {data.label}
        </div>
        {data.subtitle && (
            <div
                style={{
                  color: "#7b8796",
                  fontSize: 12,
                  marginTop: 5,
                }}
            >
              {data.subtitle}
            </div>
        )}
        {data.target && <Handle type="source" position={Position.Right} />}
      </div>
  );
}

const nodeTypes = {
  healthcare: GraphNode,
};

function App() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [relationship, setRelationship] = useState(null);

  const [doctorName, setDoctorName] = useState("Dr. Mehta");
  const [referralChain, setReferralChain] = useState([]);
  const [loadingReferral, setLoadingReferral] = useState(false);

  const [conditionNetwork, setConditionNetwork] = useState([]);
  const [loadingNetwork, setLoadingNetwork] = useState(false);

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingRelationship, setLoadingRelationship] = useState(false);

  const [selectedNode, setSelectedNode] = useState("patient");
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

        if (data?.length > 0) {
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

      if (!data?.length) {
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

      if (!data?.length) {
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

  const graphNodes = useMemo(() => {
    if (!relationship) return [];

    const patient = relationship.patient;
    const condition = relationship.condition;
    const treatment = relationship.treatment;
    const provider = relationship.provider;
    const hospital = relationship.hospital;

    return [
      patient && {
        id: "patient",
        type: "healthcare",
        position: { x: 20, y: 170 },
        data: {
          type: "patient",
          label: patient.name,
          subtitle: `${patient.age} years • ${patient.gender}`,
          color: NODE_COLORS.patient,
          source: false,
          target: true,
        },
      },
      condition && {
        id: "condition",
        type: "healthcare",
        position: { x: 250, y: 170 },
        data: {
          type: "condition",
          label: condition.name,
          subtitle: condition.category,
          color: NODE_COLORS.condition,
          source: true,
          target: true,
        },
      },
      treatment && {
        id: "treatment",
        type: "healthcare",
        position: { x: 480, y: 170 },
        data: {
          type: "treatment",
          label: treatment.name,
          subtitle: treatment.date,
          color: NODE_COLORS.treatment,
          source: true,
          target: true,
        },
      },
      provider && {
        id: "provider",
        type: "healthcare",
        position: { x: 710, y: 170 },
        data: {
          type: "provider",
          label: provider.name,
          subtitle: provider.specialty,
          color: NODE_COLORS.provider,
          source: true,
          target: true,
        },
      },
      hospital && {
        id: "hospital",
        type: "healthcare",
        position: { x: 940, y: 170 },
        data: {
          type: "hospital",
          label: hospital.name,
          subtitle: hospital.city,
          color: NODE_COLORS.hospital,
          source: true,
          target: false,
        },
      },
    ].filter(Boolean);
  }, [relationship]);

  const graphEdges = useMemo(() => {
    if (!relationship) return [];

    return [
      {
        id: "patient-condition",
        source: "patient",
        target: "condition",
        label: "DIAGNOSED_WITH",
        animated: true,
      },
      {
        id: "patient-treatment",
        source: "condition",
        target: "treatment",
        label: "RECEIVED",
        animated: true,
      },
      {
        id: "treatment-provider",
        source: "treatment",
        target: "provider",
        label: "TREATED_BY",
        animated: true,
      },
      {
        id: "provider-hospital",
        source: "provider",
        target: "hospital",
        label: "WORKS_AT",
        animated: true,
      },
    ].filter((edge) => {
      const ids = new Set(graphNodes.map((node) => node.id));
      return ids.has(edge.source) && ids.has(edge.target);
    });
  }, [relationship, graphNodes]);

  const renderDetails = () => {
    if (!relationship) {
      return (
          <div className="empty-state">
            <div className="empty-icon">◉</div>
            <h3>Explore the healthcare graph</h3>
            <p>
              Select a patient and click Explore to traverse connected
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

    const details = {
      patient: [
        ["Name", data.name],
        ["Age", `${data.age} years`],
        ["Gender", data.gender],
      ],
      condition: [
        ["Name", data.name],
        ["Category", data.category],
      ],
      treatment: [
        ["Treatment", data.name],
        ["Date", data.date],
      ],
      provider: [
        ["Name", data.name],
        ["Specialty", data.specialty],
      ],
      hospital: [
        ["Hospital", data.name],
        ["City", data.city],
      ],
    };

    const descriptions = {
      patient: "Central patient node in the healthcare relationship graph.",
      condition: "Patient is diagnosed with this condition.",
      treatment: "Patient received this treatment for the selected condition.",
      provider: "Patient is treated by this healthcare provider.",
      hospital: "The healthcare provider works at this hospital.",
    };

    return (
        <div className="node-details">
          <span className="section-label">SELECTED NODE</span>
          <h3>{selectedNode.charAt(0).toUpperCase() + selectedNode.slice(1)}</h3>

          <div className="detail-grid">
            {details[selectedNode]?.map(([label, value]) => (
                <div className="detail-item" key={label}>
                  <span>{label}</span>
                  <strong>{value || "—"}</strong>
                </div>
            ))}
          </div>

          <p className="relationship-description">
            {descriptions[selectedNode]}
          </p>
        </div>
    );
  };

  return (
      <div className="app">
        <header className="hero">
          <div className="hero-badge">COGNODB • GRAPH HEALTHCARE</div>

          <h1>Healthcare Relationship Explorer</h1>

          <p>
            Explore how patients, doctors, conditions, treatments, providers,
            and hospitals are connected through a graph database.
          </p>

          <div className="hero-stats">
            <div>
              <strong>5</strong>
              <span>Entity Types</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Relationships</span>
            </div>
            <div>
              <strong>Live</strong>
              <span>CognoDB</span>
            </div>
          </div>
        </header>

        <main className="dashboard">
          <section className="card patient-card">
            <div className="card-header">
              <div>
                <span className="section-label">GRAPH EXPLORER</span>
                <h2>Explore Patient Relationships</h2>
                <p>
                  Select a patient to discover their connected healthcare
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
                {loadingRelationship ? "Exploring..." : "Explore Graph"}
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
                    <span>Selected patient:</span>
                    <strong>{relationship.patient?.name}</strong>
                  </div>

                  <div className="flow-container">
                    <ReactFlow
                        nodes={graphNodes}
                        edges={graphEdges}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.25 }}
                        onNodeClick={(_, node) => setSelectedNode(node.id)}
                    >
                      <MiniMap
                          nodeColor={(node) =>
                              NODE_COLORS[node.id] || "#94a3b8"
                          }
                      />
                      <Controls />
                      <Background color="#dbe5ee" gap={18} size={1} />
                    </ReactFlow>
                  </div>

                  <div className="relationship-details">
                    {renderDetails()}
                  </div>
                </>
            )}

            {!loadingRelationship && !relationship && !error && (
                <div className="empty-state">
                  <div className="empty-icon">◉</div>
                  <h3>Explore the healthcare graph</h3>
                  <p>
                    Select a patient above to discover their connected condition,
                    treatment, provider, and hospital.
                  </p>
                </div>
            )}
          </section>

          <section className="feature-grid">
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
                        <div
                            className="result-item"
                            key={`${doctor.doctor}-${index}`}
                        >
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
                  <div className="empty-state compact">
                    <h3>Search a doctor</h3>
                    <p>
                      Try <strong>Dr. Mehta</strong> to explore the seeded referral
                      relationship.
                    </p>
                  </div>
              )}
            </section>

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
                {loadingNetwork ? "Loading..." : "Load Network Data"}
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
                  <div className="empty-state compact">
                    <h3>Load the healthcare network</h3>
                    <p>
                      View conditions, hospitals, and patient counts from CognoDB.
                    </p>
                  </div>
              )}
            </section>
          </section>

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
                  <strong>Condition → Treatment</strong>
                  <span>RECEIVED</span>
                </div>
              </div>

              <div className="traversal-item">
                <div className="step-number">3</div>
                <div>
                  <strong>Treatment → Provider</strong>
                  <span>TREATED_BY</span>
                </div>
              </div>

              <div className="traversal-item">
                <div className="step-number">4</div>
                <div>
                  <strong>Provider → Hospital</strong>
                  <span>WORKS_AT</span>
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
