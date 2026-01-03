module.exports = ({ data }) => `
You are a financial risk assessor for potential agricultural loans.

Applicant Profile:
${JSON.stringify(data, null, 2)}

Task:
1. Assess loan eligibility.
2. Assign a risk score (Low, Medium, High).
3. Provide a brief justification.

Output format: JSON with keys: riskScore (string), justification (string), eligible (boolean).
`;
