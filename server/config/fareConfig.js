const fareConfig = {
  Mini:  { baseFare: 30, perKm: 10, perMin: 1,   surge: 1.0, avgSpeed: 30 },
  Sedan: { baseFare: 50, perKm: 14, perMin: 1.5, surge: 1.0, avgSpeed: 28 },
  SUV:   { baseFare: 80, perKm: 18, perMin: 2,   surge: 1.0, avgSpeed: 25 },
  Auto:  { baseFare: 20, perKm: 7,  perMin: 0.5, surge: 1.0, avgSpeed: 22 },
};

const calculateFare = (cabType, distanceKm, durationMin) => {
  const c = fareConfig[cabType];
  const fare = c.baseFare + c.perKm * distanceKm + c.perMin * durationMin;
  return Math.round(fare * c.surge);
};

// ── NEW: Arrival time estimate ──────────────────────
const calculateArrival = (cabType, driverDistanceKm = 2) => {
  const config  = fareConfig[cabType];
  const minutes = Math.round((driverDistanceKm / config.avgSpeed) * 60);
  return {
    minutes,
    label: minutes <= 2  ? 'Arriving now'  :
           minutes <= 5  ? `${minutes} mins away` :
           minutes <= 10 ? `${minutes} mins away` :
                           `${minutes} mins away`
  };
};

const generateOTP = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

module.exports = { fareConfig, calculateFare, calculateArrival, generateOTP };