WITH const AS (select X AS XREF, Y AS YREF, Z AS ZREF, name as nameREF from systems_populated_v6 where systems_populated_v6.id == ?)
select id, (X-const.XREF)*(X-const.XREF) + (Y-const.YREF)*(Y-const.YREF) + (Z-const.ZREF)*(Z-const.ZREF) AS DISTANCE_SQUARED from systems_populated_v6, const
where DISTANCE_SQUARED <= ?
order by DISTANCE_SQUARED asc;
