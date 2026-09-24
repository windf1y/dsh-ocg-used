/**
 * Build both halves of the plugin as self-contained artifacts:
 *
 * - `lib/index.js` — the Host half. The only package kept external is
 *   `@deepseek-ai/cordis`, which the running DSH supplies; every other value
 *   import (the `brandString` helper) is inlined, so an installed plugin needs
 *   no `dependencies` of its own.
 * - `lib/client.js` — the browser half, emitted as the DSH client bundle
 *   contract: a CJS closure factory handed to `window.__ModuleLoader__.load`.
 *   React stays an import answered by the shell's module table; CSS Modules are
 *   compiled here (lightningcss) into a hashed class map plus a tagged style
 *   injected when the factory first materializes.
 *
 * `src/client/index.ts` is bundled from source, so the Client build never needs
 * the tsc output; only the Host entry consumes `lib/types`.
 *
 * @module dsh-ocg-used/tsdown.config
 */

import { readFile } from 'node:fs/promises'
import { isBuiltin } from 'node:module'
import { dirname, isAbsolute, relative, resolve as resolvePath } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from 'lightningcss'
import type { TsdownPlugin, UserConfig } from 'tsdown'

/** Plugin id; must equal the package name, because it keys the boot graph row. */
const PACKAGE_ID = 'dsh-ocg-used'

/** This package's root; keeps ephemeral ids and the published artifact free of build-machine paths. */
const PACKAGE_ROOT = fileURLToPath(new URL('.', import.meta.url))

/** Packages the running DSH supplies, so the Host artifact imports them instead of inlining. */
const HOST_SHARED = ['@deepseek-ai/cordis']

/** Browser baseline modules the shell seeds into its module table before any plugin bundle runs. */
const SHELL_PROVIDED = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
]

/** Virtual-id wrapper keeping module CSS away from tsdown's own stylesheet pipeline. */
const CSS_VIRTUAL_PREFIX = '\0dsh-ocg-used-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

/**
 * Emit one module: the compiled stylesheet, the class map a CSS-modules import
 * reads, and the tagged style the bundle injects once.
 * @param fileId - physical stylesheet path, used to derive the style tag id.
 * @param css - compiled CSS text.
 * @param classMap - local class name to hashed class name.
 * @returns the module source.
 */
function styleInjectionModule(fileId: string, css: string, classMap: Record<string, string>): string {
  const tagId = `${PACKAGE_ID}/${fileId.slice(fileId.lastIndexOf('/') + 1)}`
  return [
    `const css = ${JSON.stringify(css)};`,
    `const tagId = ${JSON.stringify(tagId)};`,
    'if (typeof document !== \'undefined\' && document.querySelector(\'style[data-plugin-css=\' + JSON.stringify(tagId) + \']\') === null) {',
    '  const tag = document.createElement(\'style\');',
    `  tag.dataset.plugin = ${JSON.stringify(PACKAGE_ID)};`,
    '  tag.dataset.pluginCss = tagId;',
    '  tag.textContent = css;',
    '  document.head.appendChild(tag);',
    '}',
    `export default ${JSON.stringify(classMap)};`,
  ].join('\n')
}

/** Compile `*.module.css` into a class map plus an injected style. */
const cssModules: TsdownPlugin = {
  name: 'dsh-ocg-used-css-modules',
  resolveId(source: string, importer: string | undefined) {
    if (!source.endsWith('.module.css')) return null
    const file = importer === undefined || isAbsolute(source)
      ? source
      : resolvePath(dirname(importer), source)
    return CSS_VIRTUAL_PREFIX + (isAbsolute(file) ? relative(PACKAGE_ROOT, file) : file) + CSS_VIRTUAL_SUFFIX
  },
  async load(this: { addWatchFile(file: string): void }, virtualId: string) {
    if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
    const relativeId = virtualId.slice(CSS_VIRTUAL_PREFIX.length, -CSS_VIRTUAL_SUFFIX.length)
    const fileId = isAbsolute(relativeId) ? relativeId : resolvePath(PACKAGE_ROOT, relativeId)
    // The virtual id otherwise hides the physical stylesheet from the watch graph.
    this.addWatchFile(fileId)
    const { code, exports: cssExports } = transform({
      filename: fileId,
      code: await readFile(fileId),
      cssModules: { pattern: '[hash]_[local]' },
      minify: true,
    })
    const classMap: Record<string, string> = {}
    const entries = Object.entries(cssExports ?? {}).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    for (const [local, exported] of entries) classMap[local] = exported.name
    return styleInjectionModule(fileId, code.toString(), classMap)
  },
}

const host: UserConfig = {
  name: PACKAGE_ID,
  entry: ['lib/types/index.js'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: false,
  deps: {
    neverBundle: (specifier: string) => HOST_SHARED.includes(specifier),
    alwaysBundle: (specifier: string) => !isBuiltin(specifier) && !HOST_SHARED.includes(specifier),
  },
}

const client: UserConfig = {
  name: `${PACKAGE_ID}/client`,
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  target: 'es2024',
  dts: false,
  clean: false,
  deps: {
    neverBundle: SHELL_PROVIDED,
    alwaysBundle: (specifier: string) => !SHELL_PROVIDED.includes(specifier),
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
  plugins: [cssModules],
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PACKAGE_ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
}

export default [host, client]
