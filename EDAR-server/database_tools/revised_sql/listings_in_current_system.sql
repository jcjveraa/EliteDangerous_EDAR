CREATE TEMP TABLE listings_in_current_system AS
SELECT 
*
from 
listings_in_range
where 
listings_in_range.system_id == 12024
