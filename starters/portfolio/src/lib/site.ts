export const site = {
  name: 'Jane Doe',
  role: 'Frontend developer',
  description:
    'A developer portfolio with selected work, experience, and writing.',
  summary:
    'I build web interfaces with React and TypeScript. Explore the example projects, experience, and writing below.',
}

export function pageMeta(title: string, description: string) {
  const fullTitle = `${title} | ${site.name}`
  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: description },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
    ],
  }
}
