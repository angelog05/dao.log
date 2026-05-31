export type Lang = 'en' | 'es'

export const translations = {
  en: {
    nav: {
      home: 'home',
      about: 'about',
    },
    header: {
      tagline: 'notes from the path. ai in the wild, day by day.',
    },
    menu: {
      themes: 'themes',
      language: 'language',
    },
    index: {
      loading: 'loading...',
      error: 'error loading posts.',
      empty: 'no posts yet. the path begins.',
    },
    post: {
      loading: 'loading...',
      notFound: '404 — page not found.',
      backHome: '← home',
    },
    about: {
      title: 'About dao.log',
      p1: 'This is where I document how I use AI in my work and daily life. Not the polished version — the real one. The debugging sessions, the rabbit holes, the things that actually worked.',
      p2: 'The name comes from <strong>道</strong> (Dào) — the path. Not a destination, not a framework. Just the road you walk, day by day.',
      p3: "I'm a developer. I work with AI not as a novelty but as a daily tool. These are my field notes.",
    },
  },
  es: {
    nav: {
      home: 'inicio',
      about: 'acerca',
    },
    header: {
      tagline: 'notas desde el camino. ia en la vida real, día a día.',
    },
    menu: {
      themes: 'temas',
      language: 'idioma',
    },
    index: {
      loading: 'cargando...',
      error: 'error al cargar las entradas.',
      empty: 'aún no hay entradas. el camino comienza.',
    },
    post: {
      loading: 'cargando...',
      notFound: '404 — página no encontrada.',
      backHome: '← inicio',
    },
    about: {
      title: 'Acerca de dao.log',
      p1: 'Aquí documento cómo uso la IA en mi trabajo y vida cotidiana. No la versión pulida — la real. Las sesiones de depuración, los caminos sin salida, las cosas que realmente funcionaron.',
      p2: 'El nombre viene de <strong>道</strong> (Dào) — el camino. No un destino, no un framework. Solo el camino que recorres, día a día.',
      p3: 'Soy desarrollador. Uso la IA no como una novedad sino como una herramienta diaria. Estas son mis notas de campo.',
    },
  },
} satisfies Record<Lang, typeof translations['en']>

export function t(lang: Lang, path: string): string {
  const keys = path.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[lang]
  for (const key of keys) {
    value = value?.[key]
  }
  return value ?? path
}
