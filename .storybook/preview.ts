import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

// p5.jsグローバルモック（ブラウザ/Node環境対応）
const globalObj = typeof window !== 'undefined' ? window : global;
// @ts-expect-error - グローバル変数の定義
globalObj.p5 = class P5Mock {};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#333333' },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1920px', height: '1080px' },
        },
      },
    },
    docs: {
      story: {
        // DocsページでストーリーをiFrame内でレンダリング
        // これによりZustandストアの状態が各ストーリー間で分離される
        inline: false,
      },
    },
  },
};

export default preview;
