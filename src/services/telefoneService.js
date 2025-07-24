const { By } = require('selenium-webdriver');

async function buscarTelefones(driver) {
  const fixos = [], celulares = [];
  const divs = await driver.findElements(By.css('.panel.panel-lemit.avoid-page-break'));

  for (const div of divs) {
    const titulo = await div.findElement(By.css('h4.lemit-title')).getText();
    const tipo = titulo.toLowerCase().includes('fixo') ? 'fixo' : titulo.toLowerCase().includes('celular') ? 'celular' : null;

    if (!tipo) continue;

    const links = await div.findElements(By.css('a[href^="tel:"]'));
    for (const link of links) {
      const numero = await link.getText();
      tipo === 'fixo' ? fixos.push(numero) : celulares.push(numero);
    }
  }

  return { fixos, celulares };
}

module.exports = { buscarTelefones };