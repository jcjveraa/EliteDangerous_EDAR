CREATE TEMP TABLE listings_in_current_system_XYZZYX AS
SELECT
  *
from
  listings_in_range_XYZZYX
where
  listings_in_range_XYZZYX.system_id == @current_system_id