export function countGraphemes(str: string) {
  const segmenter = new Intl.Segmenter('ja-JP', { granularity: 'grapheme' })
  const graphemeSegments = segmenter.segment(str)
  return Array.from(graphemeSegments).length
}
