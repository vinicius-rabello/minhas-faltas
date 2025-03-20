WITH user_events AS (
	SELECT * FROM events
	WHERE user_id = 1 AND date < CURRENT_DATE
), user_agg AS (
	SELECT
		user_id,
		subject_id,
		SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) AS attended_classes,
		SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) AS missed_classes,
		SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) AS canceled_classes,
		SUM(CASE WHEN status IS NULL THEN 1 ELSE 0 END) AS pending_classes,
		COUNT(*) AS num_classes
	FROM user_events
	GROUP BY user_id, subject_id
), final AS (
	SELECT *, ROUND(100*attended_classes::NUMERIC/num_classes, 2) AS attendance
	FROM user_agg
)
SELECT * FROM final