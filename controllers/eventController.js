const pool = require("../db/db");

const createOrUpdateEvent = async (req, res) => {
    try {
        // Extract data from request body
        const { userEmail, subjectName, date, status } = req.body;

        // Validate required fields
        if (!userEmail || !subjectName || !date || !status) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: userEmail, subjectName, date, or status' 
            });
        }

        // Validate status value
        const validStatuses = ['attended', 'missed', 'not_happened', 'canceled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Insert into database
        const result = await pool.query(
            `INSERT INTO events (user_email, subject_name, date, status)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_email, subject_name, date) 
            DO UPDATE SET status = EXCLUDED.status 
            RETURNING *`,
            [userEmail, subjectName, date, status]
        );

        const newEvent = result.rows[0];
        
        return res.status(201).json({
            success: true,
            data: newEvent
        });
    } catch (err) {
        console.error('Error creating/updating event:', err);
        
        if (err.code === '23505') { // Unique violation code in PostgreSQL
            return res.status(409).json({
                success: false,
                message: 'Conflict with existing record'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while creating/updating event'
        });
    }
};

module.exports = { createOrUpdateEvent }