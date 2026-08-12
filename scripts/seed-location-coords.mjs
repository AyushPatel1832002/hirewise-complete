// Backfills latitude/longitude on the `locations` table.
// Idempotent: only rows with NULL coordinates are updated.
import mysql from "mysql2/promise";

// [city, country, latitude, longitude]
const COORDS = [
  ["San Francisco", "US", 37.7749, -122.4194],
  ["New York", "US", 40.7128, -74.006],
  ["Austin", "US", 30.2672, -97.7431],
  ["Seattle", "US", 47.6062, -122.3321],
  ["Boston", "US", 42.3601, -71.0589],
  ["Chicago", "US", 41.8781, -87.6298],
  ["Denver", "US", 39.7392, -104.9903],
  ["Atlanta", "US", 33.749, -84.388],
  ["Miami", "US", 25.7617, -80.1918],
  ["Portland", "US", 45.5152, -122.6784],
  ["London", "UK", 51.5074, -0.1278],
  ["Berlin", "DE", 52.52, 13.405],
  ["Amsterdam", "NL", 52.3676, 4.9041],
  ["Paris", "FR", 48.8566, 2.3522],
  ["Toronto", "CA", 43.6532, -79.3832],
  ["Vancouver", "CA", 49.2827, -123.1207],
  ["Bangalore", "IN", 12.9716, 77.5946],
  ["Mumbai", "IN", 19.076, 72.8777],
  ["Singapore", "SG", 1.3521, 103.8198],
  ["Tokyo", "JP", 35.6762, 139.6503],
  ["Sydney", "AU", -33.8688, 151.2093],
  ["Dublin", "IE", 53.3498, -6.2603],
  ["Lisbon", "PT", 38.7223, -9.1393],
  ["Tel Aviv", "IL", 32.0853, 34.7818],
  ["Stockholm", "SE", 59.3293, 18.0686],
  ["Zurich", "CH", 47.3769, 8.5417],
  ["Warsaw", "PL", 52.2297, 21.0122],
  ["Prague", "CZ", 50.0755, 14.4378],
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const updates = COORDS.map(
    ([city, country, lat, lon]) =>
      `UPDATE locations SET latitude = ${lat}, longitude = ${lon} WHERE city = '${city}' AND country = '${country}' AND (latitude IS NULL OR longitude IS NULL)`,
  );
  for (const u of updates) {
    await conn.query(u);
  }
  const [rows] = await conn.query(
    "SELECT COUNT(*) AS c FROM locations WHERE latitude IS NOT NULL",
  );
  console.log("Locations with coordinates:", rows[0].c);
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
