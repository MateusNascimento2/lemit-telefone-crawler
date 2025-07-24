const { Builder, By } = require('selenium-webdriver');
const { loginNoLemit, buscarCpfNoLemit, pegarListaDeCPFNoLemit, cpfEhInconclusivo } = require('./services/lemitService');
const { buscarTelefones } = require('./services/telefoneService');
const { tratarDados } = require('./utils/nomeUtils');
const cessaoRepository = require('./repositories/cessaoRepository');


async function Main() {
  let driver;

  try {
    const dados = await cessaoRepository.buscarAchados();
    const arrayNomes = tratarDados(dados);

    driver = await new Builder().forBrowser('firefox').build();

    await loginNoLemit(driver);

    for (const item of arrayNomes) {
      console.log(item);

      const listasPorNome = [];

      for (const nome of item.nome_requerente) {
        try {
          const listaCPF = await pegarListaDeCPFNoLemit(driver, nome);
          listasPorNome.push(listaCPF);
        } catch (e) {
          console.error(`Erro ao buscar CPF para ${nome}:`, e.message);
          listasPorNome.push([]);
        }
      }

      const nenhumaListaComCpf = listasPorNome.every(lista => !Array.isArray(lista) || lista.length === 0);

      if (nenhumaListaComCpf) {
        await cessaoRepository.marcarAchado(item.numero_do_precatorio, 'CPF não encontrado');
        continue;
      }

      const inconclusivo = cpfEhInconclusivo(listasPorNome, item.cpf_cnpj_parcial_do_beneficiario);

      if (inconclusivo) {
        console.log(`CPF inconclusivo para precatório ${item.numero_do_precatorio}`);
        await cessaoRepository.marcarAchado(item.numero_do_precatorio, 'CPF inconclusivo');
        continue;
      }


      for (let i = 0; i < item.nome_requerente.length; i++) {
        const nome = item.nome_requerente[i];
        const listaCPF = listasPorNome[i];

        const match = listaCPF.find(cpfCompleto =>
          item.cpf_cnpj_parcial_do_beneficiario.some(parcial =>
            cpfCompleto.replace(/\D/g, '').startsWith(parcial.slice(0, 3))
          )
        );

        if (!match) {
          await cessaoRepository.marcarAchado(item.numero_do_precatorio, 'CPF não encontrado');
          continue
        }

        try {
          const elementoCPF = await buscarCpfNoLemit(driver, nome, item.cpf_cnpj_parcial_do_beneficiario);
          if (!elementoCPF) {
            await cessaoRepository.marcarAchado(item.numero_do_precatorio, 'CPF não encontrado');
            continue;
          };

          await driver.executeScript("arguments[0].scrollIntoView(true);", elementoCPF);
          await driver.sleep(500);
          await elementoCPF.click();
          await driver.sleep(3000);

          await driver.findElement(By.css('.btn.btn-primary')).click();
          await driver.sleep(3000);

          const telefones = await buscarTelefones(driver);
          console.log(`Telefones de ${nome}`);
          console.log('   Fixos:', telefones.fixos);
          console.log('   Celulares:', telefones.celulares);

          await cessaoRepository.salvarTelefoneNoBanco(nome, telefones.fixos, telefones.celulares, item.numero_do_precatorio);

          const achouTelefone = telefones.fixos.length > 0 || telefones.celulares.length > 0;
          await cessaoRepository.marcarAchado(item.numero_do_precatorio, achouTelefone ? 'SIM' : 'NAO');
        } catch (e) {
          console.error(`Erro ao processar nome ${nome}:`, e.message);
          continue;
        }
      }
    }
  } catch (e) {
    console.error("Erro principal:", e);
  } finally {
    if (driver) await driver.quit();
  }
}

Main();
