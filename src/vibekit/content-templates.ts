/**
 * 5 essential content templates for Jeans.
 * Each is a PenNode tree with all visual props bound to $variables.
 * Templates are fill_container so they reflow on format switch.
 */

import { nanoid } from 'nanoid'
import type { PenNode } from '@/types/pen'

function id() { return nanoid(8) }

/** Title/Intro slide — large heading, subtitle, author name */
export function createTitleTemplate(): PenNode {
  return {
    id: id(), type: 'frame', name: 'Title / Intro',
    width: 'fill_container' as unknown as number,
    height: 'fill_container' as unknown as number,
    layout: 'vertical',
    padding: '$space-xl',
    gap: '$space-lg',
    fill: [{ type: 'solid', color: '$color-bg' }],
    children: [
      { id: id(), type: 'frame', name: 'spacer', width: 'fill_container' as unknown as number, height: 'fill_container' as unknown as number, layout: 'vertical', children: [] },
      {
        id: id(), type: 'text', name: 'Heading',
        content: 'Your Big Idea Here',
        fontFamily: '$font-heading', fontSize: '$size-heading-xl' as unknown as number,
        fill: [{ type: 'solid', color: '$color-text' }],
        width: 'fill_container' as unknown as number,
        textAlign: 'left',
      } as PenNode,
      {
        id: id(), type: 'text', name: 'Subtitle',
        content: 'A compelling subtitle that draws readers in',
        fontFamily: '$font-body', fontSize: '$size-body' as unknown as number,
        fill: [{ type: 'solid', color: '$color-text-muted' }],
        width: 'fill_container' as unknown as number,
        textAlign: 'left',
      } as PenNode,
      {
        id: id(), type: 'text', name: 'Author',
        content: '@yourname',
        fontFamily: '$font-body', fontSize: '$size-caption' as unknown as number,
        fill: [{ type: 'solid', color: '$color-primary' }],
        width: 'fill_container' as unknown as number,
        textAlign: 'left',
      } as PenNode,
    ],
  } as PenNode
}

/** Content slide — heading + body text */
export function createContentTemplate(): PenNode {
  return {
    id: id(), type: 'frame', name: 'Content',
    width: 'fill_container' as unknown as number,
    height: 'fill_container' as unknown as number,
    layout: 'vertical',
    padding: '$space-xl',
    gap: '$space-md',
    fill: [{ type: 'solid', color: '$color-bg' }],
    children: [
      {
        id: id(), type: 'text', name: 'Heading',
        content: 'Key Point',
        fontFamily: '$font-heading', fontSize: '$size-heading-lg' as unknown as number,
        fill: [{ type: 'solid', color: '$color-text' }],
        width: 'fill_container' as unknown as number,
      } as PenNode,
      {
        id: id(), type: 'frame', name: 'Divider',
        width: 80, height: '$stroke-decorative' as unknown as number,
        fill: [{ type: 'solid', color: '$color-primary' }],
        children: [],
      } as PenNode,
      {
        id: id(), type: 'text', name: 'Body',
        content: 'Explain your point clearly and concisely. Use short paragraphs for readability on mobile.',
        fontFamily: '$font-body', fontSize: '$size-body' as unknown as number,
        fill: [{ type: 'solid', color: '$color-text' }],
        width: 'fill_container' as unknown as number,
        lineHeight: 1.6,
      } as PenNode,
      { id: id(), type: 'frame', name: 'spacer', width: 'fill_container' as unknown as number, height: 'fill_container' as unknown as number, layout: 'vertical', children: [] },
    ],
  } as PenNode
}

/** Quote slide — large pull quote with attribution */
export function createQuoteTemplate(): PenNode {
  return {
    id: id(), type: 'frame', name: 'Quote',
    width: 'fill_container' as unknown as number,
    height: 'fill_container' as unknown as number,
    layout: 'vertical',
    padding: '$space-xl',
    gap: '$space-lg',
    fill: [{ type: 'solid', color: '$color-surface' }],
    justifyContent: 'center',
    children: [
      {
        id: id(), type: 'text', name: 'Quote Text',
        content: '"The best way to predict the future is to create it."',
        fontFamily: '$font-editorial', fontSize: '$size-heading-md' as unknown as number,
        fill: [{ type: 'solid', color: '$color-text' }],
        width: 'fill_container' as unknown as number,
        fontStyle: 'italic',
      } as PenNode,
      {
        id: id(), type: 'text', name: 'Attribution',
        content: '— Peter Drucker',
        fontFamily: '$font-body', fontSize: '$size-body' as unknown as number,
        fill: [{ type: 'solid', color: '$color-primary' }],
        width: 'fill_container' as unknown as number,
      } as PenNode,
    ],
  } as PenNode
}

/** Stat/Metric slide — big number with label */
export function createStatTemplate(): PenNode {
  return {
    id: id(), type: 'frame', name: 'Stat',
    width: 'fill_container' as unknown as number,
    height: 'fill_container' as unknown as number,
    layout: 'vertical',
    padding: '$space-xl',
    gap: '$space-md',
    fill: [{ type: 'solid', color: '$color-primary' }],
    justifyContent: 'center',
    alignItems: 'center',
    children: [
      {
        id: id(), type: 'text', name: 'Number',
        content: '10x',
        fontFamily: '$font-heading', fontSize: 96 as number,
        fill: [{ type: 'solid', color: '$color-bg' }],
        textAlign: 'center',
        fontWeight: 800,
      } as PenNode,
      {
        id: id(), type: 'text', name: 'Label',
        content: 'faster content creation',
        fontFamily: '$font-body', fontSize: '$size-heading-md' as unknown as number,
        fill: [{ type: 'solid', color: '$color-bg' }],
        textAlign: 'center',
      } as PenNode,
      {
        id: id(), type: 'text', name: 'Supporting Text',
        content: 'Compared to traditional design tools',
        fontFamily: '$font-body', fontSize: '$size-caption' as unknown as number,
        fill: [{ type: 'solid', color: '$color-bg' }],
        textAlign: 'center',
        opacity: 0.7,
      } as PenNode,
    ],
  } as PenNode
}

/** CTA/Closing slide — call to action + author info */
export function createCTATemplate(): PenNode {
  return {
    id: id(), type: 'frame', name: 'CTA / Closing',
    width: 'fill_container' as unknown as number,
    height: 'fill_container' as unknown as number,
    layout: 'vertical',
    padding: '$space-xl',
    gap: '$space-lg',
    fill: [{ type: 'solid', color: '$color-bg' }],
    justifyContent: 'center',
    children: [
      {
        id: id(), type: 'text', name: 'CTA Heading',
        content: 'Ready to get started?',
        fontFamily: '$font-heading', fontSize: '$size-heading-lg' as unknown as number,
        fill: [{ type: 'solid', color: '$color-text' }],
        width: 'fill_container' as unknown as number,
        textAlign: 'center',
      } as PenNode,
      {
        id: id(), type: 'text', name: 'CTA Body',
        content: 'Follow me for more insights on building in public.',
        fontFamily: '$font-body', fontSize: '$size-body' as unknown as number,
        fill: [{ type: 'solid', color: '$color-text-muted' }],
        width: 'fill_container' as unknown as number,
        textAlign: 'center',
      } as PenNode,
      {
        id: id(), type: 'frame', name: 'Button',
        width: 200, height: 48,
        fill: [{ type: 'solid', color: '$color-primary' }],
        cornerRadius: '$radius-md' as unknown as number,
        layout: 'vertical',
        justifyContent: 'center',
        alignItems: 'center',
        x: 0, y: 0,
        children: [
          {
            id: id(), type: 'text', name: 'Button Text',
            content: 'Learn More',
            fontFamily: '$font-body', fontSize: '$size-body' as unknown as number,
            fill: [{ type: 'solid', color: '$color-bg' }],
            textAlign: 'center',
            fontWeight: 600,
          } as PenNode,
        ],
      } as PenNode,
    ],
  } as PenNode
}

/** All 5 templates in order */
export const CONTENT_TEMPLATES = [
  { id: 'title-intro', name: 'Title / Intro', create: createTitleTemplate },
  { id: 'content', name: 'Content', create: createContentTemplate },
  { id: 'quote', name: 'Quote', create: createQuoteTemplate },
  { id: 'stat-metric', name: 'Stat / Metric', create: createStatTemplate },
  { id: 'cta-closing', name: 'CTA / Closing', create: createCTATemplate },
]
