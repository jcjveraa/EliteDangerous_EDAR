delete from listings_v6 where listings_v6.collected_at < @min_epoch_to_keep;