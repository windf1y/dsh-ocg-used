/**
 * The composer-toolbar quota chip: three metered windows of the OpenCode Go
 * subscription, each rendered as the share still available, with the used
 * share, the percentage split, and the reset instant in the hover panel.
 *
 * The component owns exactly two local facts — the latest read and whether the
 * panel is open — and reaches the host through the package's own route, which
 * the apply world already authenticated. All copy comes from the `opencodeGoQuota`
 * dictionary; every color comes from a theme token through the CSS module.
 *
 * @module dsh-ocg-used/client/QuotaChip
 */
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { type ReactElement } from 'react';
import { NS } from './locales.ts';
/** Full props for the resident composer's right-hand control row. */
export type QuotaChipProps = PropsRuntime<'conversation.input.right'> & PropsLocale<typeof NS>;
/**
 * The composer-toolbar quota chip.
 * @param props - the slot's runtime share plus this namespace's translate seat.
 * @returns the chip, with its hover panel while the pointer is inside it.
 */
export declare function QuotaChip({ t }: QuotaChipProps): ReactElement;
