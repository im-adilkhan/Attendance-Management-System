from app.utils.geo import haversine_meters


def test_haversine_zero_distance():
    assert haversine_meters(12.9, 77.5, 12.9, 77.5) == 0


def test_haversine_known_distance_is_meters():
    distance = haversine_meters(0, 0, 0, 1)
    assert 111000 < distance < 112000
