WITH RECURSIVE date_series AS (
    SELECT 
        DATE_TRUNC('month', MIN(start_period))::DATE AS date, 
        DATE_TRUNC('month', MAX(end_period)) + INTERVAL '1 month - 1 day' AS end_date
    FROM subjects
	WHERE user_id = 1
    UNION ALL
    SELECT (date + INTERVAL '1 day')::DATE, end_date
    FROM date_series
    WHERE date < end_date
), joined_events AS (
	SELECT ds.date, e.subject_id, e.status
	FROM date_series ds
	LEFT JOIN events e
	ON ds.date = e.date AND user_id = 1
), final AS (
	SELECT je.*, s.is_required FROM joined_events je
	LEFT JOIN subjects s
	ON je.subject_id = s.subject_id
)
SELECT * FROM final
ORDER BY date
LIMIT 5
