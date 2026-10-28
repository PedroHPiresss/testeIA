import { expect, test } from '@playwright/test';

test('joga contra o bot, exibe o resultado e permite iniciar outra partida', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Card Game Laboratory' })).toBeVisible();
  await page.getByRole('button', { name: 'Ver regras' }).click();
  await expect(page.getByRole('dialog', { name: 'Regras provisórias' })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar regras' }).click();
  await page.getByRole('button', { name: 'Iniciar partida' }).click();

  await expect(page.getByRole('heading', { name: 'Sua mão' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Sua vez');

  for (let turn = 0; turn < 12; turn += 1) {
    const resultHeading = page.getByRole('alert').getByRole('heading');
    if (await resultHeading.isVisible().catch(() => false)) break;

    const cards = page.getByRole('button', { name: /Carta de Valor/ });
    await expect(cards.first()).toBeVisible();
    await cards.first().click();
    await page.getByRole('button', { name: 'Jogar carta selecionada' }).click();

    await expect.poll(async () => {
      const status = await page.getByRole('status').innerText();
      return status === 'Sua vez' || status.includes('venceu') || status.includes('empatada');
    }, { timeout: 5_000 }).toBe(true);
  }

  const resultHeading = page.getByRole('alert').getByRole('heading');
  await expect(resultHeading).toBeVisible();
  await page.getByRole('button', { name: 'Jogar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'Sua mão' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Sua vez');
});
