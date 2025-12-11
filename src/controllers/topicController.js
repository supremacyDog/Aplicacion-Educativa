const pool = require("../db");
const fs = require("fs");
const path = require("path");

exports.getTopicById = async (req, res) => {
  const { id } = req.params;
  const topic = await pool.query("SELECT * FROM topics WHERE id = $1", [id]);
  res.json(topic.rows[0]);
};

exports.updateTopic = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // tomado del login
  const { titulo, descripcion, contenido } = req.body;

  // obtener versión previa
  const oldTopic = await pool.query("SELECT * FROM topics WHERE id = $1", [id]);
  const oldContent = oldTopic.rows[0].contenido;

  // actualizar BD
  await pool.query(
    `UPDATE topics SET titulo=$1, descripcion=$2, contenido=$3, fecha_actualizacion=NOW()
     WHERE id=$4`,
    [titulo, descripcion, contenido, id]
  );

  // generar archivo txt
  const folderPath = path.join("logs", "topics", `topic_${id}`);
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `version_${timestamp}.txt`;
  const filePath = path.join(folderPath, fileName);

  const logContent = `
Editor: ${userId}
Fecha: ${new Date().toLocaleString()}

---- CONTENIDO ANTERIOR ----
${oldContent}

---- CONTENIDO NUEVO ----
${contenido}
  `;

  fs.writeFileSync(filePath, logContent);

  // guardar versión en BD
  await pool.query(
    `INSERT INTO topic_versions (topic_id, edited_by, url_archivo, resumen_cambio)
     VALUES ($1, $2, $3, $4)`,
    [id, userId, `/logs/topics/topic_${id}/${fileName}`, "Edición del tópico"]
  );

  res.json({ message: "Tópico actualizado y versión guardada" });
};