/* eslint-disable camelcase */
const db = require('../database/db');

async function buscarAchados() {
  const query = `
    SELECT 
      numero_do_precatorio,
      GROUP_CONCAT(DISTINCT nome_requerente SEPARATOR ';') AS nome_requerente,
      GROUP_CONCAT(DISTINCT cpf_cnpj_parcial_do_beneficiario SEPARATOR ';') AS cpf_cnpj_parcial_do_beneficiario
    FROM precatorios_orcamentarios_trf2
    WHERE marcado = 'X'
      AND (telefone_achado IS NULL OR TRIM(telefone_achado) = '' OR telefone_achado = 'NULL')
    GROUP BY numero_do_precatorio;
  `;


  const rows = await db.query(query);
  return rows;
}


async function marcarAchado(numeroPrecatorio, status) {
  const query = `
    UPDATE precatorios_orcamentarios_trf2
    SET telefone_achado = ?
    WHERE numero_do_precatorio = ?
  `;

  await db.query(query, [status, numeroPrecatorio]);
}

async function salvarTelefoneNoBanco(nome_requerente, telefones_fixos, telefones_celulares, numero_precatorio) {
  const query = `
    INSERT INTO telefones_precatorios_federais 
      (nome_requerente, telefones_fixos, telefones_celulares, numero_precatorio)
    VALUES (?, ?, ?, ?)
  `;

  await db.query(query, [
    nome_requerente,
    JSON.stringify(telefones_fixos),
    JSON.stringify(telefones_celulares),
    numero_precatorio
  ]);
}

module.exports = {
  buscarAchados,
  marcarAchado,
  salvarTelefoneNoBanco
};
