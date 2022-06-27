CREATE TEMP TABLE systems_in_range as 
SELECT		sp1.id,
							sp1.edsm_id,
							sp1.name,
							(sp1.X - sp2.X) *(sp1.X - sp2.X) + (sp1.Y - sp2.Y) *(sp1.Y - sp2.Y) + (sp1.Z - sp2.Z) *(sp1.Z - sp2.Z) AS distance_squared
						FROM
							systems_populated_v6 AS sp1
							JOIN systems_populated_v6 AS sp2
						WHERE
							sp2.id = 12024
							AND distance_squared <= 100;