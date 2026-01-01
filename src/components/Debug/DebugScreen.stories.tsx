import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { DebugScreen } from './DebugScreen';

const withMockStore = (Story: React.ComponentType) => {
  function StoryWrapper() {
    useEffect(() => {
      // DebugScreenは特別なストア状態を必要としません
      // exitDebugScreen関数がコンソールに出力するだけにします
      useGameStore.setState({
        exitDebugScreen: () => {
          console.log('Exit debug screen');
        },
      });

      return () => {
        // クリーンアップ
      };
    }, []);

    return <Story />;
  }

  return <StoryWrapper />;
};

const meta = {
  title: 'Debug/DebugScreen',
  component: DebugScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '座標変換デバッグ画面。ダーツボードをクリックして座標変換の動作を検証できます。判定結果と実際の位置を記録し、JSONでエクスポート可能です。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [withMockStore],
} satisfies Meta<typeof DebugScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト状態
 * ボードをクリックして座標変換のデバッグを開始できます
 */
export const Default: Story = {};

/**
 * 使い方の説明付き
 */
export const WithInstructions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '使い方:\n' +
          '1. 左側のダーツボードをクリックします\n' +
          '2. 右側のパネルに判定結果が表示されます\n' +
          '3. 正しい位置を選択して「記録する」ボタンをクリック\n' +
          '4. 記録が下部の一覧に追加されます\n' +
          '5. 「JSONエクスポート」でデータをダウンロードできます',
      },
    },
  },
};
