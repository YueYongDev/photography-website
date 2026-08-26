const mysql = require("mysql2/promise");

const PHOTO_ID = "92f21d67-bcdf-4d55-af4b-e91c2f7a4e96";
const EXPECTED_URL =
  "https://cdn.ytools.xyz/photos/DSC09911-1757431030018.JPG";

function normalizeDatabaseUrl(value) {
  const url = new URL(value);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("pgbouncer");
  return url.toString();
}

exports.main = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  const connection = await mysql.createConnection({
    uri: normalizeDatabaseUrl(process.env.DATABASE_URL),
    connectTimeout: 5_000,
    timezone: "Z",
  });

  try {
    await connection.beginTransaction();

    const [[photo]] = await connection.execute(
      "SELECT id, url, title FROM photo_site_photos WHERE id = ? FOR UPDATE",
      [PHOTO_ID]
    );
    if (!photo) throw new Error("Expected photo does not exist");
    if (photo.url !== EXPECTED_URL) {
      throw new Error("Photo URL changed; refusing to delete");
    }

    const [[coverReferences]] = await connection.execute(
      "SELECT COUNT(*) AS count FROM photo_site_city_sets WHERE cover_photo_id = ?",
      [PHOTO_ID]
    );
    if (Number(coverReferences.count) !== 0) {
      throw new Error("Photo is still used as a city cover");
    }

    const [result] = await connection.execute(
      "DELETE FROM photo_site_photos WHERE id = ? AND url = ?",
      [PHOTO_ID, EXPECTED_URL]
    );
    if (result.affectedRows !== 1) {
      throw new Error(`Expected one deletion, got ${result.affectedRows}`);
    }

    await connection.commit();

    const [[counts]] = await connection.query(`
      SELECT
        COUNT(*) AS totalPhotos,
        SUM(url LIKE 'https://cdn.ytools.xyz/%') AS oldCdnRows,
        SUM(url LIKE 'https://ytools-d8gboj3ce7caccb14-1253563876.tcloudbaseapp.com/photo-site/photos/%') AS cloudBaseRows
      FROM photo_site_photos
    `);

    return {
      ok: true,
      deleted: { id: photo.id, title: photo.title, url: photo.url },
      coverReferences: Number(coverReferences.count),
      counts,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
};
