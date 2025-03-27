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
                    'pending' AS status
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

const getEventsForDateAndUser = async (req, res) => {
  try {
    const { date, userId } = req.params; // Obtém a data e usuário pela URL
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User is required",
      });
    }

    const result = await pool.query(
      `SELECT e.id, e.date, e.status, 
              s.subject_name, s.class_time 
       FROM events e
       JOIN subjects s ON e.subject_id = s.subject_id
       WHERE e.date = $1::DATE AND e.user_id = $2
       ORDER BY s.class_time ASC`,
      [date, userId] // Passando `date` como string diretamente
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

const getDailyAttendance = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      WITH RECURSIVE date_series AS (
          SELECT 
              DATE_TRUNC('month', MIN(start_period))::DATE AS date, 
              DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day' AS end_date
          FROM subjects
        WHERE user_id = $1
          UNION ALL
          SELECT (date + INTERVAL '1 day')::DATE, end_date
          FROM date_series
          WHERE date < end_date
      ), joined_events AS (
        SELECT ds.date, e.subject_id, e.status
        FROM date_series ds
        LEFT JOIN events e
        ON ds.date = e.date AND user_id = $1
      ), joined_subjects AS (
        SELECT je.*, s.is_required FROM joined_events je
        LEFT JOIN subjects s
        ON je.subject_id = s.subject_id
      ), status_agg AS (
        SELECT
          date,
          SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) as classes_attended,
          SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as classes_missed,
          SUM(CASE WHEN subject_id IS NOT NULL AND status <> 'cancelled' THEN 1 ELSE 0 END) as total_classes
        FROM joined_subjects
        GROUP BY date
      ), final AS (
        SELECT
          *,
          CASE
            WHEN total_classes <> 0
              THEN classes_attended::REAL/total_classes
            ELSE 0
          END AS attendance,
          CASE
            WHEN classes_missed <> 0 AND classes_attended = 0
            THEN 1
            ELSE 0
          END AS is_missed_day
        FROM status_agg
        WHERE date IS NOT NULL
      )
      SELECT * FROM final
      ORDER BY date
    `;

    const { rows } = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("Error fetching daily attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch daily attendance data",
      error: error.message,
    });
  }
};

const getUserSummary = async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
    WITH user_events AS (
      SELECT * FROM events
      WHERE user_id = $1 AND date < CURRENT_DATE
    ), user_agg AS (
      SELECT
        user_id,
        subject_id,
        SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) AS attended_classes,
        SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) AS missed_classes,
        SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) AS canceled_classes,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_classes,
        SUM(CASE WHEN status <> 'canceled' THEN 1 ELSE 0 END) AS total_classes
      FROM user_events
      GROUP BY user_id, subject_id
    ), with_attendance AS (
      SELECT *, ROUND(100*attended_classes::NUMERIC/total_classes, 2) AS attendance
      FROM user_agg
    ), final AS (
      SELECT wa.*, s.subject_name, s.is_required FROM with_attendance wa
      LEFT JOIN subjects s
      ON wa.subject_id = s.subject_id
    )
    SELECT * FROM final`;
    const { rows } = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("Error fetching user summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user summary data",
      error: error.message,
    });
  }
};

module.exports = {
  createEventsBetweenStartAndEndPeriod,
  getEventsForDateAndUser,
  updateStatus,
  getDailyAttendance,
  getUserSummary,
};
