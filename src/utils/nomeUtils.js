function tratarDados(dados) {
  return dados.map(item => ({
    numero_do_precatorio: item.numero_do_precatorio,
    nome_requerente: item.nome_requerente.split(';').map(n => n.trim()).filter(Boolean),
    cpf_cnpj_parcial_do_beneficiario: item.cpf_cnpj_parcial_do_beneficiario.split(';').map(c => c.trim()).filter(Boolean)
  }));
}

module.exports = { tratarDados };