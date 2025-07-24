const { By } = require('selenium-webdriver');
require('dotenv').config({ path: '../.env' });


async function loginNoLemit(driver) {
  await driver.get('https://lemitti.com/auth/login');
  await driver.findElement(By.id('email')).sendKeys(process.env.INPUT_EMAIL);
  await driver.findElement(By.id('password')).sendKeys(process.env.INPUT_PASSWORD);
  await driver.sleep(2000);
  await driver.findElement(By.xpath('//*[@id="content"]/div/div/div/form/div/div/div[4]/button')).click();
  await driver.sleep(10000);
}

async function pegarListaDeCPFNoLemit(driver, nome) {

  await driver.get('https://lemitti.com/queries/avancado/nome');
  await driver.sleep(2000);

  await driver.findElement(By.id('term')).sendKeys(nome);
  await driver.findElement(By.css('.btn.btn-primary')).click();
  await driver.sleep(3000);

  const elementosCPFs = await driver.findElements(By.className('width-175'));

  if (elementosCPFs) {
    const cpfs = [];
    await driver.executeScript(`
      const banner = document.querySelector('.cc-window');
      if (banner) banner.style.display = 'none';
    `);

    await driver.sleep(3000)

    for (const cpf of elementosCPFs) {
      const textCPF = await cpf.getText();
      if (textCPF === 'Documento') continue
      cpfs.push(textCPF);
    }

    return cpfs

  }



  return [];
}

function cpfEhInconclusivo(listaDeListas, cpfsParciais) {
  const prefixos = cpfsParciais.map(p => p.slice(0, 3));

  for (const prefixo of prefixos) {
    let listasComPrefixo = 0;

    for (const lista of listaDeListas) {
      const temMatch = lista.some(cpf => cpf.replace(/\D/g, '').startsWith(prefixo));
      if (temMatch) listasComPrefixo++;
    }

    if (listasComPrefixo > 1) {
      // Este prefixo aparece em mais de uma lista -> inconclusivo
      return true;
    }
  }

  // Nenhum prefixo se repete em listas diferentes
  return false;
}

async function buscarCpfNoLemit(driver, nome, cpfsParciais) {
  await driver.get('https://lemitti.com/queries/avancado/nome');
  await driver.sleep(2000);

  await driver.findElement(By.id('term')).sendKeys(nome);
  await driver.findElement(By.css('.btn.btn-primary')).click();
  await driver.sleep(3000);

  await driver.executeScript(`
    const banner = document.querySelector('.cc-window');
    if (banner) banner.style.display = 'none';
  `);

  const elementosCPFs = await driver.findElements(By.className('width-175'));

  for (const cpfElement of elementosCPFs) {
    const textCPF = await cpfElement.getText();
    const prefixo = textCPF.slice(0, 3);

    const corresponde = cpfsParciais.some(parcial => parcial.slice(0, 3) === prefixo);

    if (corresponde) return cpfElement;
  }

  console.log('Nenhum CPF compatível encontrado para:', nome);
  return null;
}

module.exports = { loginNoLemit, buscarCpfNoLemit, pegarListaDeCPFNoLemit, cpfEhInconclusivo };