const yieldPrompt = ({ data }) => {
    return `
You are an expert Agronomist specializing in yield maximization.

**Farm Data:**
- **Location**: ${data.location}
- **Soil**: ${data.soilType}
- **Season**: ${data.season}
- **Inputs**: ${JSON.stringify(data.inputs)}

**Task:**
1.  **Predict Yield**: Estimate likely harvest quantity (in Quintals/Acre).
2.  **Gap Analysis**: Why is this not 100% potential? (e.g., Low NPK, wrong sowing time).
3.  **Recommendations**:
    - **Nutrient Management**: Specific advice on NPK or Micronutrients based on soil type.
    - **Watering**: Smart irrigation tip.
    - **Intercropping**: Suggest a companion crop if suitable.

**Output Format (JSON):**
{
    "predicted_yield": "Range in Quintals",
    "potential_yield": "Max possible",
    "key_factors": ["List of influencing factors"],
    "suggestions": ["Specific actionable tips for soil and crop care"]
}
`;
};

module.exports = yieldPrompt;
