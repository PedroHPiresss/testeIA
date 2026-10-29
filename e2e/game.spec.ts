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

test('arena jogável usa mãos e recursos simétricos, posiciona legalmente e avança a rodada', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Arena jogável (teste)' }).click();
  await expect(page.getByRole('heading', { name: 'Arena de combate' })).toBeVisible();
  await expect(page.getByRole('grid', { name: 'Campo de Líder do jogador' }).getByRole('gridcell')).toHaveCount(12);
  await expect(page.getByText('Recursos: 3')).toHaveCount(2);
  await expect(page.getByRole('heading', { name: 'Sua mão' })).toBeVisible();

  const humanCard = page.locator('.arena-card:not(:disabled)').first();
  await expect(humanCard).toBeVisible();
  const cardLabel = await humanCard.getAttribute('aria-label');
  const cost = Number(cardLabel?.match(/custo (\d+)/i)?.[1]);
  await humanCard.click();
  const legalCell = page.locator('.combat-player').first().locator('.combat-cell.valid-placement').first();
  await expect(legalCell).toBeVisible();
  await legalCell.click();
  await expect(page.locator('.combat-player').first().locator('.combat-cell.occupied')).toHaveCount(1);
  await expect(page.locator('.combat-player').first().locator('.arena-resources')).toContainText(`Recursos: ${3 - cost}`);
  await expect(page.locator('.arena-card')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Encerrar preparação' })).toBeEnabled();

  await page.getByRole('button', { name: 'Encerrar preparação' }).click();
  await expect(page.getByText('Rodada 2', { exact: true })).toBeVisible({ timeout: 5_000 });
  await expect(page.getByRole('heading', { name: 'Histórico da partida' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Encerrar preparação' })).toBeEnabled();
  await expect(page.locator('.combat-log')).toContainText('causou');
  await page.getByRole('button', { name: 'Reiniciar partida' }).click();
  await expect(page.getByText('Rodada 1', { exact: true })).toBeVisible();
  await expect(page.locator('.combat-player').first().locator('.arena-resources')).toContainText('Recursos: 3');
  await expect(page.locator('.combat-player').first().locator('.combat-cell.occupied')).toHaveCount(0);
});

test('uma partida da arena pode terminar e bloquear novas ações', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Arena jogável (teste)' }).click();

  for (let turn = 0; turn < 18; turn += 1) {
    const result = page.getByRole('alert');
    if (await result.isVisible().catch(() => false)) break;
    await expect.poll(async () => {
      const roundbar = await page.locator('.arena-roundbar').innerText();
      return roundbar.includes('Sua vez') || roundbar.includes('Partida encerrada');
    }, { timeout: 5_000 }).toBe(true);
    if (await result.isVisible().catch(() => false)) break;

    const troop = page.locator('.arena-card:not(:disabled)').filter({ hasText: 'Tropa' }).last();
    const availableCards = page.locator('.arena-card:not(:disabled)');
    if (await troop.count()) {
      await troop.click();
      const target = page.locator('.combat-player').first().locator('.combat-cell.valid-placement').last();
      await target.click();
    } else if (await availableCards.count()) {
      await availableCards.first().click();
      await page.locator('.combat-player').first().locator('.combat-cell.valid-placement').last().click();
    }
    await page.getByRole('button', { name: 'Encerrar preparação' }).click();
  }

  await expect(page.getByRole('alert')).toBeVisible({ timeout: 5_000 });
  await expect(page.getByRole('button', { name: 'Encerrar preparação' })).toBeDisabled();
});
