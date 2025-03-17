const pool = require("../db/db");

const createSubject = async (req, res) => {
    try {
        // Extract data from request body
        const {
            userEmail,
            subjectName,
            weekdays,
            classTime,
            isRequired
        } = req.body;

        // Validate required fields
        if (!userEmail || !subjectName || !weekdays || !classTime) {
            console.log('Missing required fields:', { userEmail, subjectName, weekdays, classTime });
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields' 
            });
        }

        console.log('Creating new subject:', { 
            userEmail, 
            subjectName, 
            weekdays, 
            classTime, 
            isRequired 
        });

        // Insert into database
        const result = await pool.query(
            `INSERT INTO subjects (
                user_email,
                subject_name,
                weekdays,
                class_time,
                is_required
            ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userEmail, subjectName, weekdays, classTime, isRequired]
        );

        const newSubject = result.rows[0];
        console.log('Subject created successfully:', newSubject);
        
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

module.exports = { createSubject };