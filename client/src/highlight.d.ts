declare module 'highlight.js/lib/core' {
  import { HLJSApi } from 'highlight.js';
  const hljs: HLJSApi;
  export default hljs;
}

declare module 'highlight.js/lib/languages/javascript' {
  import { LanguageFn } from 'highlight.js';
  const javascript: LanguageFn;
  export default javascript;
}
declare module 'highlight.js/lib/languages/bash' {
  import { LanguageFn } from 'highlight.js';
  const bash: LanguageFn;
  export default bash;
}
