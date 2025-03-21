const pool = require("../db/db");

const createEventsBetweenStartAndEndPeriod = async (req, res) => {
  try {
    // Extract data from request body
    const { subjectId } = req.body;

    // Validate required fields
    if (!subjectId) {
      console.log("Missing required fields:", {
        subjectId,
      });
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Insert into database
    const result = await pool.query(
      `INSERT INTO events (user_id, subject_id, date, status)
                WITH RECURSIVE date_series AS (
                SELECT start_period AS date, end_period
                FROM subjects
                WHERE subject_id = $1
                UNION ALL
                SELECT (date + INTERVAL '1 day')::DATE, end_period
                FROM date_series
                WHERE date < end_period
            ), final AS (
                SELECT 
                    s.user_id, 
                    s.subject_id, 
                    ds.date,
                    NULL AS status
                FROM date_series ds
                JOIN subjects s ON s.subject_id = $1
                WHERE EXTRACT(DOW FROM ds.date) = ANY(s.weekdays)
            )
            SELECT * FROM final`,
      [subjectId]
    );

    const newEvent = result.rows[0];

    return res.status(201).json({
      success: true,
      data: newEvent,
    });
  } catch (err) {
    console.error("Error creating/updating events:", err);

    if (err.code === "23505") {
      // Unique violation code in PostgreSQL
      return res.status(409).json({
        success: false,
        message: "Conflict with existing record",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating/updating event",
    });
  }
};

const getEventsForDate = async (req, res) => {
  try {
    const { date } = req.params; // Obtém a data da URL

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const result = await pool.query(
      `SELECT e.id, e.date, e.status, 
              s.subject_name, s.class_time 
       FROM events e
       JOIN subjects s ON e.subject_id = s.subject_id
       WHERE e.date = $1::DATE
       ORDER BY s.class_time ASC`,
      [date] // Passando `date` como string diretamente
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching events",
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { eventId } = req.params; // From URL parameter
    const { status } = req.body; // From request body

    // Validate status value
    const validStatuses = ["pending", "attended", "missed", "canceled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const result = await pool.query(
      `
      UPDATE events
      SET status = $1
      WHERE id = $2
      RETURNING *
    `,
      [status, eventId]
    );

    // Check if any row was updated
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Send success response
    res.json({
      success: true,
      message: "Status updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { createEventsBetweenStartAndEndPeriod, getEventsForDate, updateStatus };
