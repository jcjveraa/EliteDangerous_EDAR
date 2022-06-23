CREATE temp table @@@TEMP_TABLE_NAME@@@ as select
          stations_v6.id as station_id, stations_v6.max_landing_pad_size as max_landing_pad_size
        from
          (
            SELECT
              sp1.id,
              sp1.edsm_id,
              sp1.name,
              (sp1.X - sp2.X) *(sp1.X - sp2.X) + (sp1.Y - sp2.Y) *(sp1.Y - sp2.Y) + (sp1.Z - sp2.Z) *(sp1.Z - sp2.Z) AS distance_squared
            FROM
              systems_populated_v6 AS sp1
              LEFT JOIN systems_populated_v6 AS sp2
            WHERE
              sp2.id = @system_id 
			  @@@TARGET_SYSTEM@@@
              AND distance_squared <= @max_range
          ) as systems_in_range
          LEFT JOIN stations_v6 ON systems_in_range.id = stations_v6.system_id;