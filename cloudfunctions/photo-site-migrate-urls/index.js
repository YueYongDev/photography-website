const mysql = require("mysql2/promise");

const EXPECTED_MAPPINGS = 177;
const STATIC_PREFIX =
  "https://ytools-d8gboj3ce7caccb14-1253563876.tcloudbaseapp.com/photo-site/photos/";

function normalizeDatabaseUrl(value) {
  const url = new URL(value);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("pgbouncer");
  return url.toString();
}

function validateMappings(mappings) {
  if (!Array.isArray(mappings) || mappings.length !== EXPECTED_MAPPINGS) {
    throw new Error(`Expected exactly ${EXPECTED_MAPPINGS} media mappings`);
  }

  const ids = new Set();
  for (const item of mappings) {
    if (
      !item ||
      typeof item.id !== "string" ||
      typeof item.oldUrl !== "string" ||
      typeof item.newUrl !== "string" ||
      !item.oldUrl.startsWith("https://cdn.ytools.xyz/") ||
      !item.newUrl.startsWith(STATIC_PREFIX)
    ) {
      throw new Error("Invalid media mapping");
    }
    if (ids.has(item.id)) throw new Error(`Duplicate photo id: ${item.id}`);
    ids.add(item.id);
  }
}

async function getSnapshot(connection) {
  const [rows] = await connection.query(`
    SELECT
      COUNT(*) AS totalPhotos,
      SUM(url LIKE 'https://cdn.ytools.xyz/%') AS oldCdnRows,
      SUM(url LIKE '${STATIC_PREFIX}%') AS cloudBaseRows,
      SUM(visibility = 'public') AS publicRows,
      SUM(visibility = 'private') AS privateRows,
      SUM(is_favorite = 1) AS favoriteRows
    FROM photo_site_photos
  `);
  return rows[0];
}

exports.main = async (event) => {
  validateMappings(event && event.mappings);
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured");

  const connection = await mysql.createConnection({
    uri: normalizeDatabaseUrl(databaseUrl),
    connectTimeout: 5_000,
    timezone: "Z",
  });

  try {
    const before = await getSnapshot(connection);
    await connection.beginTransaction();

    let affectedRows = 0;
    for (const mapping of event.mappings) {
      const [result] = await connection.execute(
        "UPDATE photo_site_photos SET url = ?, updated_at = updated_at WHERE id = ? AND url = ?",
        [mapping.newUrl, mapping.id, mapping.oldUrl]
      );
      affectedRows += result.affectedRows;
    }

    if (affectedRows !== EXPECTED_MAPPINGS) {
      throw new Error(
        `Refusing partial migration: expected ${EXPECTED_MAPPINGS} updates, got ${affectedRows}`
      );
    }

    await connection.commit();
    const after = await getSnapshot(connection);

    const [[references]] = await connection.query(`
      SELECT COUNT(*) AS brokenCoverReferences
      FROM photo_site_city_sets city
      LEFT JOIN photo_site_photos photo ON photo.id = city.cover_photo_id
      WHERE city.cover_photo_id IS NOT NULL AND photo.id IS NULL
    `);

    return {
      ok: true,
      affectedRows,
      before,
      after,
      brokenCoverReferences: references.brokenCoverReferences,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
};
