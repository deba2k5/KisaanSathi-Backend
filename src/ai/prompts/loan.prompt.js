const loanPrompt = ({ applicant }) => {
    return `
You are a Credit Risk Analyst for a rural bank.
Your goal is to assess a micro-loan application for a farmer.

**Applicant Profile:**
- **Land Size**: ${applicant.landSize} acres
- **Crop**: ${applicant.crop}
- **Requested Amount**: ₹${applicant.amount}
- **History**: ${applicant.creditHistory || 'New Borrower'}

**Task:**
1.  **Risk Assessment**: Is the loan amount realistic for this crop/land size? (e.g., ₹50k for 1 acre Wheat is standard, ₹5L is risky).
2.  **ROI Check**: Will this crop selection likely generate enough profit to repay?
3.  **Verdict**: Assign a Risk Score (0-100, where 0 is safe).

**Output Format (JSON):**
{
    "risk_score": 0-100,
    "eligibility": "High/Medium/Low",
    "max_eligible_amount": "Estimated limit in INR",
    "reasoning": "Explain clearly WHY—e.g., 'Amount too high for land size' or 'Good crop choice'."
}
`;
};

module.exports = loanPrompt;
