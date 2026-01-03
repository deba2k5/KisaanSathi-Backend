module.exports = ({ data }) => `
You are an expert agronomist.

Task: Predict crop yield.

Input Data:
${JSON.stringify(data, null, 2)}

Requirements:
1. Estimate yield in kg/acre.
2. List key factors influencing this prediction (positive and negative).
3. Suggest one intervention to improve yield.

Output format: JSON with keys: estimatedYield, factors, suggestion.
`;
