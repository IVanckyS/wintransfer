import pkg from 'transbank-sdk';
const { WebpayPlus, Options, Environment, IntegrationApiKeys, IntegrationCommerceCodes } = pkg;

/**
 * Con TRANSBANK_COMMERCE_CODE + TRANSBANK_API_KEY definidas → PRODUCCIÓN.
 * Sin ellas → ambiente de INTEGRACIÓN de Transbank (tarjetas de prueba,
 * no mueve dinero real). Así el mismo código sirve para desarrollo y para
 * activar producción solo agregando las variables en Vercel.
 */
export function webpayTransaction() {
  const cc = process.env.TRANSBANK_COMMERCE_CODE;
  const key = process.env.TRANSBANK_API_KEY;
  const options =
    cc && key
      ? new Options(cc, key, Environment.Production)
      : new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration);
  return new WebpayPlus.Transaction(options);
}
