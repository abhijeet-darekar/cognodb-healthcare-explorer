# Healthcare Explorer — Graph Data Model

The application models healthcare entities as a connected graph.

```mermaid
graph TD

    Patient["Patient<br/>id, name, age"]
    Condition["Condition<br/>name, category"]
    Treatment["Treatment<br/>name, type"]
    Provider["Provider<br/>name, experience"]
    Specialty["Specialty<br/>name"]

    Patient -->|HAS_CONDITION| Condition
    Patient -->|RECEIVED| Treatment
    Treatment -->|TREATS| Condition
    Treatment -->|PROVIDED_BY| Provider
    Provider -->|SPECIALIZES_IN| Specialty
