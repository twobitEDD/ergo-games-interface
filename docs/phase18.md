All wallet, settlement, contract, transaction-building, signature UX, ErgoScript, box/value handling, Fleet SDK, Nautilus, Babel fee, or AppKit work must follow docs/ekb-integration.md.

Before implementation:
- classify scope
- mark EKB-required stories
- use get_pattern for architecture decisions
- use get_skill for implementation path decisions
- use get_eip where standards/data formats apply
- use get_ergoscript_ref for ErgoScript and box/value behavior

Before merge:
- include EKB queries used
- include implementation decision
- include ErgoScript/EIP references
- include audit_contract artifact where applicable
- address findings
- include audit_verify artifact
- document affected release gates
- document compliance/trust-language impact

Stop conditions:
- missing EKB evidence
- unresolved contract audit findings
- audit_verify not run after fixes
- compliance controls undefined
- incident controls undefined