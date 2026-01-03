const LoanApplication = require('../models/loanModel');

// --- Helper Functions (Mock) ---

const calculateFraudRisk = (data) => {
    // Mock Logic: valid range 0-100 (0 = Safe, 100 = Fraud)
    // Heuristics for demo:
    // 1. High amount > 500,000 -> Risk + 30
    // 2. Short tenure < 6 months -> Risk + 10
    // 3. Random fluctuation -> +/- 10

    let score = 10; // Base score
    if (data.requestedAmount > 500000) score += 30;
    if (data.tenureMonths < 6) score += 10;

    // Add randomness (0-20)
    score += Math.floor(Math.random() * 20);

    // Cap at 100
    return Math.min(score, 100);
};

const generateBlockchainTx = () => {
    const chars = '0123456789abcdef';
    let txHash = '0x';
    let contractAddr = '0x';

    for (let i = 0; i < 64; i++) {
        txHash += chars[Math.floor(Math.random() * 16)];
    }

    for (let i = 0; i < 40; i++) {
        contractAddr += chars[Math.floor(Math.random() * 16)];
    }

    return { txHash, contractAddr };
};


const submitLoan = async (req, res) => {
    try {
        const data = req.body;
        console.log("Received Loan Application:", data);

        // 1. Calculate Fraud Risk
        const fraudScore = calculateFraudRisk(data);
        console.log(`Fraud Risk Score: ${fraudScore}`);

        // 2. Determine initial status & blockchain details
        let status = 'PENDING';
        let blockchainTxHash = null;
        let smartContractAddress = null;

        // Auto-approve if low risk (< 30) for demo purposes
        if (fraudScore < 30) {
            status = 'APPROVED';
            const txDetails = generateBlockchainTx();
            blockchainTxHash = txDetails.txHash;
            smartContractAddress = txDetails.contractAddr;
            console.log("Auto-Approved! Generated Smart Contract:", smartContractAddress);
        }

        // Create and save new loan application
        const newLoan = new LoanApplication({
            ...data,
            fraudRiskScore: fraudScore,
            status: status,
            blockchainTxHash: blockchainTxHash,
            smartContractAddress: smartContractAddress
        });

        await newLoan.save();

        console.log("Loan Application Saved:", newLoan._id);

        res.json({
            success: true,
            id: newLoan._id,
            message: status === 'APPROVED' ? "Loan approved instantly via Smart Contract!" : "Loan submitted for review.",
            status: status,
            fraudScore: fraudScore
        });
    } catch (error) {
        console.error("Loan Controller Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const submitCropSelection = async (req, res) => {
    res.json({ success: true, message: "Crop selected" });
};

const getAllLoans = async (req, res) => {
    try {
        const loans = await LoanApplication.find().sort({ createdAt: -1 });
        res.json({ success: true, loans });
    } catch (error) {
        console.error("Error fetching loans:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserLoans = async (req, res) => {
    try {
        const { uid } = req.params;
        const loans = await LoanApplication.find({ farmerUid: uid }).sort({ createdAt: -1 });
        res.json({ success: true, loans });
    } catch (error) {
        console.error("Error fetching user loans:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateLoanStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Check if we need to generate blockchain details on manual approval
        let updateData = { status };

        if (status === 'APPROVED') {
            // Check if it already has one? (Ideally check DB, but we can just overwrite or set if null)
            // For simplicity, always generate if approving and let's assume valid.
            const existingLoan = await LoanApplication.findById(id);
            if (existingLoan && !existingLoan.blockchainTxHash) {
                const txDetails = generateBlockchainTx();
                updateData.blockchainTxHash = txDetails.txHash;
                updateData.smartContractAddress = txDetails.contractAddr;
            }
        }

        const updatedLoan = await LoanApplication.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedLoan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }

        res.json({ success: true, loan: updatedLoan });
    } catch (error) {
        console.error("Error deleting loan:", error); // Log message typo in original, keeping consistent logging style
        res.status(500).json({ success: false, message: error.message });
    }
}


const deleteLoan = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedLoan = await LoanApplication.findByIdAndDelete(id);

        if (!deletedLoan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }

        res.json({ success: true, message: "Loan deleted successfully" });
    } catch (error) {
        console.error("Error deleting loan:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { submitLoan, submitCropSelection, getAllLoans, getUserLoans, updateLoanStatus, deleteLoan };
