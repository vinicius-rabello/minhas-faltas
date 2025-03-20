const pool = require("../db/db");

const createSubject = async (req, res) => {
    try {
        // Extract data from request body
        const {
            userId,
            subjectName,
            weekdays,
            classTime,
            startPeriod,
            endPeriod,
            isRequired
        } = req.body;

        // Validate required fields
        if (!userId || !subjectName || !weekdays || !classTime || !startPeriod || !endPeriod) {
            console.log('Missing required fields:', { userId, subjectName, weekdays, classTime, startPeriod, endPeriod });
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }

        // Insert into database
        const result = await pool.query(
            `INSERT INTO subjects (
                user_id,
                subject_name,
                weekdays,
                class_time,
                start_period,
                end_period,
                is_required
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [userId, subjectName, weekdays, classTime, startPeriod, endPeriod, isRequired]
        );

        const newSubject = result.rows[0];
        
        return res.status(201).json({
            success: true,
            data: newSubject
        });
    } catch (err) {
        console.error('Error creating subject:', err);
        
        // Handle different types of errors
        if (err.code === '23505') { // Unique constraint violation
            return res.status(409).json({
                success: false,
                message: 'Subject already exists'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while creating subject'
        });
    }
};

const getSubjectsByUserAndWeekDay = async (req, res) => {
    try {
        const { user_id, weekday } = req.params;
        const result = await pool.query(
            `SELECT * FROM subjects
            WHERE user_id = $1
            AND $2 = ANY (weekdays)`, [user_id, weekday]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No subjects found for this user and weekday." });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createSubject, getSubjectsByUserAndWeekDay };